use bellman::{
    gadgets::{
        boolean::{AllocatedBit, Boolean},
        multipack,
        sha256::sha256,
    },
    groth16, Circuit, ConstraintSystem, SynthesisError,
};
use bls12_381::Bls12;
use ff::PrimeField;
use pairing::Engine;
use rand::rngs::OsRng;
use sha2::{Digest, Sha256};
use std::time::Instant;

/// This is a toy code for ZK-rollup
fn sha256d<Scalar: PrimeField, CS: ConstraintSystem<Scalar>>(
    mut cs: CS,
    data: &[Boolean],
) -> Result<Vec<Boolean>, SynthesisError> {
    // Flip endianness of each input byte
    let input: Vec<_> = data
        .chunks(8)
        .map(|c| c.iter().rev())
        .flatten()
        .cloned()
        .collect();

    let mid = sha256(cs.namespace(|| "SHA-256(input)"), &input)?;
    let res = sha256(cs.namespace(|| "SHA-256(mid)"), &mid)?;

    // Flip endianness of each output byte
    Ok(res
        .chunks(8)
        .map(|c| c.iter().rev())
        .flatten()
        .cloned()
        .collect())
}

struct MyCircuit {
    /// The input to SHA-256d we are proving that we know. Set to `None` when we
    /// are verifying a proof (and do not have the witness data).
    preimage: Option<[u8; 80]>,
}

impl<Scalar: PrimeField> Circuit<Scalar> for MyCircuit {
    fn synthesize<CS: ConstraintSystem<Scalar>>(self, cs: &mut CS) -> Result<(), SynthesisError> {
        // Compute the values for the bits of the preimage. If we are verifying a proof,
        // we still need to create the same constraints, so we return an equivalent-size
        // Vec of None (indicating that the value of each bit is unknown).
        let bit_values = if let Some(preimage) = self.preimage {
            preimage
                .into_iter()
                .map(|byte| (0..8).map(move |i| (byte >> i) & 1u8 == 1u8))
                .flatten()
                .map(|b| Some(b))
                .collect()
        } else {
            vec![None; 80 * 8]
        };
        assert_eq!(bit_values.len(), 80 * 8);

        // Witness the bits of the preimage.
        let preimage_bits = bit_values
            .into_iter()
            .enumerate()
            // Allocate each bit.
            .map(|(i, b)| AllocatedBit::alloc(cs.namespace(|| format!("preimage bit {}", i)), b))
            // Convert the AllocatedBits into Booleans (required for the sha256 gadget).
            .map(|b| b.map(Boolean::from))
            .collect::<Result<Vec<_>, _>>()?;

        // Compute hash = SHA-256d(preimage).
        let hash = sha256d(cs.namespace(|| "SHA-256d(preimage)"), &preimage_bits)?;

        // Expose the vector of 32 boolean variables as compact public inputs.
        multipack::pack_into_inputs(cs.namespace(|| "pack hash"), &hash)
    }
}

fn main() {
    // Create parameters for our circuit. In a production deployment these would
    // be generated securely using a multiparty computation.

    let start = Instant::now();
    println!("0");
    let params = {
        let c = MyCircuit { preimage: None };
        groth16::generate_random_parameters::<Bls12, _, _>(c, &mut OsRng).unwrap()
    };

    // Prepare the verification key (for proof verification).
    let pvk = groth16::prepare_verifying_key(&params.vk);

    let duration = start.elapsed();

    println!("Setup time: {:?}", duration);

    let start = Instant::now();

    // Pick a preimage and compute its hash.
    let preimage = [42; 80];
    let hash = Sha256::digest(&Sha256::digest(&preimage));

    // Create an instance of our circuit (with the preimage as a witness).
    let c = MyCircuit {
        preimage: Some(preimage),
    };

    // Create a Groth16 proof with our parameters.
    let proof = groth16::create_random_proof(c, &params, &mut OsRng).unwrap();

    let duration = start.elapsed();

    println!("Generate proof time: {:?}", duration);
    let start = Instant::now();

    // Pack the hash as inputs for proof verification.
    let hash_bits = multipack::bytes_to_bits_le(&hash);
    let inputs = multipack::compute_multipacking(&hash_bits);

    // Check the proof!
    assert!(groth16::verify_proof(&pvk, &proof, &inputs).is_ok());
    let duration = start.elapsed();

    println!("Verify time is: {:?}", duration);
}

// use bellman::groth16::{
//     create_random_proof, generate_random_parameters, prepare_verifying_key, verify_proof,
// };
// use bellman::{Circuit, ConstraintSystem, SynthesisError};
// use bls12_381::Bls12;
// use ff::Field;
// use pairing::Engine;

// use rand::thread_rng;

// // Our simple circuit. It proves knowledge of a square root 'x' of a public value 'a'.
// struct SquareRootCircuit<E: Engine> {
//     a: Option<E::Fr>,
//     x: Option<E::Fr>,
// }

// // Implementation of the SquareRootCircuit
// impl<E: Engine> Circuit<E> for SquareRootCircuit<E> {
//     fn synthesize<CS: ConstraintSystem<E>>(self, cs: &mut CS) -> Result<(), SynthesisError> {
//         // allocate private value x
//         let x_value = cs.alloc(|| "x", || self.x.ok_or(SynthesisError::AssignmentMissing))?;

//         // allocate public (input) value a
//         let a_value = cs.alloc_input(|| "a", || self.a.ok_or(SynthesisError::AssignmentMissing))?;

//         // enforce a = x * x
//         cs.enforce(
//             || "x * x = a",
//             |lc| lc + x_value,
//             |lc| lc + x_value,
//             |lc| lc + a_value,
//         );
//         Ok(())
//     }
// }

// // The main function where we generate and verify the proof
// fn main() {
//     // create a rng
//     let rng = &mut thread_rng();

//     // define the private and public inputs to the circuit
//     let x: Fr = rng.gen();
//     let a: Fr = x.square();

//     // create an instance of our circuit
//     let circuit = SquareRootCircuit {
//         a: Some(a),
//         x: Some(x),
//     };

//     // create groth16 parameters
//     let params = {
//         let c = SquareRootCircuit::<Bls12> { a: None, x: None };
//         generate_random_parameters::<Bls12, _, _>(c, rng).unwrap()
//     };

//     // prepare the verification key (for proof verification)
//     let pvk = prepare_verifying_key(&params.vk);

//     // create a groth16 proof
//     let proof = create_random_proof(circuit, &params, rng).unwrap();

//     // verify the proof
//     let is_valid = verify_proof(&pvk, &proof, &[a]).unwrap();

//     // check the result
//     assert!(is_valid);
//     println!("Proof is valid!");
// }
