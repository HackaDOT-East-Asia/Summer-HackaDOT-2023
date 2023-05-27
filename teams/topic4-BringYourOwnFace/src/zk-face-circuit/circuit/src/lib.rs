mod fuzzy;
use std::fs::File;
use std::marker::PhantomData;
pub mod helper;
pub mod poseidon_circuit;
use crate::fuzzy::*;
use crate::poseidon_circuit::*;
use halo2_base::halo2_proofs::circuit::{AssignedCell, Cell, Region, SimpleFloorPlanner, Value};
use halo2_base::halo2_proofs::halo2curves::bn256::Fr;
use halo2_base::halo2_proofs::halo2curves::FieldExt;
use halo2_base::halo2_proofs::plonk::{Circuit, Column, ConstraintSystem, Instance};
use halo2_base::halo2_proofs::{circuit::Layouter, plonk::Error};
use halo2_base::{
    gates::{flex_gate::FlexGateConfig, range::RangeConfig, GateInstructions},
    utils::PrimeField,
    Context,
};
use halo2_base::{
    gates::{range::RangeStrategy::Vertical, RangeInstructions},
    ContextParams, SKIP_FIRST_PASS,
};
use halo2_base::{AssignedValue, QuantumCell};
// use halo2_dynamic_sha256::{
//     AssignedHashResult, Field, Sha256CompressionConfig, Sha256DynamicConfig,
// };
pub use crate::helper::*;
use itertools::Itertools;
use serde_json;
// use sha2::{Digest, Sha256};
use poseidon::Poseidon;
use snark_verifier_sdk::CircuitExt;

#[derive(Debug, Clone)]
pub struct FacialRecoverResult<'a> {
    pub assigned_commitment: Vec<AssignedValue<'a, Fr>>,
    pub assigned_commitment_hash: AssignedValue<'a, Fr>,
    pub assigned_feature_hash: AssignedValue<'a, Fr>,
    pub assigned_message: Vec<AssignedValue<'a, Fr>>,
    pub assigned_message_hash: AssignedValue<'a, Fr>,
}

#[derive(Debug, Clone)]
pub struct FacialRecoverConfig {
    fuzzy_commitment: FuzzyCommitmentConfig,
    max_msg_size: usize,
}

impl FacialRecoverConfig {
    pub fn configure(
        meta: &mut ConstraintSystem<Fr>,
        word_size: usize,
        max_msg_size: usize,
        range_config: RangeConfig<Fr>,
        error_threshold: u64,
    ) -> Self {
        let fuzzy_commitment = FuzzyCommitmentConfig::configure(
            meta,
            range_config.clone(),
            error_threshold,
            word_size,
        );

        Self {
            fuzzy_commitment,
            max_msg_size,
        }
    }

    pub fn auth_and_sign<'v: 'a, 'a>(
        &self,
        ctx: &mut Context<'v, Fr>,
        poseidon: &'a PoseidonChipBn254_8_58<'v, Fr>,
        features: &[u8],
        errors: &[u8],
        commitment: &[u8],
        message: &[u8],
    ) -> Result<FacialRecoverResult<'a>, Error> {
        let fuzzy_result = self
            .fuzzy_commitment
            .recover_and_hash(ctx, poseidon, features, errors, commitment)?;
        let mut message_ext = message.to_vec();
        message_ext.append(&mut vec![0; self.max_msg_size - message.len()]);
        println!("message_ext: {:?}", message_ext);
        let gate = self.gate();
        println!("gate: {:?}", gate);
        let assigned_message = message_ext
            .into_iter()
            .map(|val| gate.load_witness(ctx, Value::known(Fr::from(val as u64))))
            .collect_vec();
        println!("assigned_message: {:?}", assigned_message);
        let hash_input = vec![fuzzy_result.assigned_word, assigned_message.clone()].concat();
        println!("hash_input: {:?}", hash_input);
        let assigned_message_hash = poseidon.hash_elements(ctx, &gate, &hash_input)?.0[0].clone();
        println!("assigned_message_hash: {:?}", assigned_message_hash);
        let assigned_commitment_hash = poseidon
            .hash_elements(ctx, &gate, &fuzzy_result.assigned_commitment)?
            .0[0]
            .clone();
        println!("assigned_commitment_hash: {:?}", assigned_commitment_hash);
        Ok(FacialRecoverResult {
            assigned_commitment: fuzzy_result.assigned_commitment,
            assigned_feature_hash: fuzzy_result.assigned_feature_hash,
            assigned_message,
            assigned_message_hash,
            assigned_commitment_hash,
        })
    }

    pub fn range(&self) -> &RangeConfig<Fr> {
        self.fuzzy_commitment.range()
    }

    pub fn gate(&self) -> &FlexGateConfig<Fr> {
        self.range().gate()
    }

    pub fn new_context<'a, 'b>(&'b self, region: Region<'a, Fr>) -> Context<'a, Fr> {
        self.fuzzy_commitment.new_context(region)
    }

    pub fn finalize(&self, ctx: &mut Context<Fr>) {
        self.fuzzy_commitment.finalize(ctx);
    }
}

pub const FACIAL_RECOVER_CONFIG_ENV: &'static str = "EMAIL_VERIFY_CONFIG";
#[derive(serde::Serialize, serde::Deserialize)]
pub struct DefaultFacialRecoverConfigParams {
    pub degree: u32,
    pub num_advice: usize,
    pub num_lookup_advice: usize,
    pub num_fixed: usize,
    pub lookup_bits: usize,
    pub error_threshold: u64,
    pub word_size: usize,
    pub max_msg_size: usize,
}

#[derive(Debug, Clone)]
pub struct DefaultFacialRecoverConfig {
    inner: FacialRecoverConfig,
    instance: Column<Instance>, // 1. commitment hash 2. feature hash 3. message hash 4. message
}

#[derive(Debug, Clone)]
pub struct DefaultFacialRecoverCircuit {
    pub features: Vec<u8>,
    pub errors: Vec<u8>,
    pub commitment: Vec<u8>,
    pub message: Vec<u8>,
}

impl Default for DefaultFacialRecoverCircuit {
    fn default() -> Self {
        let params = Self::read_config_params();
        let word_size = params.word_size;
        Self {
            features: vec![0; word_size],
            errors: vec![0; word_size],
            commitment: vec![0; word_size],
            message: vec![],
        }
    }
}

impl Circuit<Fr> for DefaultFacialRecoverCircuit {
    type Config = DefaultFacialRecoverConfig;
    type FloorPlanner = SimpleFloorPlanner;

    fn without_witnesses(&self) -> Self {
        Self::default()
    }

    fn configure(meta: &mut ConstraintSystem<Fr>) -> Self::Config {
        let params = Self::read_config_params();
        let range_config = RangeConfig::configure(
            meta,
            Vertical,
            &[params.num_advice],
            &[params.num_lookup_advice],
            params.num_fixed,
            params.lookup_bits,
            0,
            params.degree as usize,
        );
        let inner = FacialRecoverConfig::configure(
            meta,
            params.word_size,
            params.max_msg_size,
            range_config,
            params.error_threshold,
        );
        let instance = meta.instance_column();
        meta.enable_equality(instance);
        Self::Config { inner, instance }
    }

    fn synthesize(
        &self,
        config: Self::Config,
        mut layouter: impl Layouter<Fr>,
    ) -> Result<(), Error> {
        config.inner.range().load_lookup_table(&mut layouter)?;
        let mut first_pass = SKIP_FIRST_PASS;
        let mut instance_cell = vec![];
        layouter.assign_region(
            || "facial recover",
            |region| {
                if first_pass {
                    first_pass = false;
                    return Ok(());
                }
                let ctx = &mut config.inner.new_context(region);
                let poseidon = PoseidonChipBn254_8_58::new(ctx, config.inner.gate());
                let result = config.inner.auth_and_sign(
                    ctx,
                    &poseidon,
                    &self.features,
                    &self.errors,
                    &self.commitment,
                    &self.message,
                )?;
                println!("result: {:?}", result);
                let gate = config.inner.gate();
                let packed_msg = result
                    .assigned_message
                    .chunks(16)
                    .map(|bytes| {
                        let mut sum = gate.load_zero(ctx);
                        for idx in 0..16 {
                            sum = gate.mul_add(
                                ctx,
                                QuantumCell::Existing(&bytes[idx]),
                                QuantumCell::Constant(Fr::from_u128(1u128 << (8 * idx))),
                                QuantumCell::Existing(&sum),
                            );
                        }
                        sum
                    })
                    .collect_vec();
                println!("packed_msg: {:?}", packed_msg);
                debug_assert_eq!(16 * packed_msg.len(), result.assigned_message.len());
                config.inner.finalize(ctx);
                instance_cell.push(result.assigned_commitment_hash.cell());
                instance_cell.push(result.assigned_feature_hash.cell());
                instance_cell.push(result.assigned_message_hash.cell());
                instance_cell.append(&mut packed_msg.into_iter().map(|v| v.cell()).collect_vec());

                Ok(())
            },
        )?;
        // for (idx, cell) in instance_cell.into_iter().enumerate() {
        //     layouter.constrain_instance(cell, config.instance, idx)?;
        // }
        Ok(())
    }
}

impl CircuitExt<Fr> for DefaultFacialRecoverCircuit {
    fn num_instance(&self) -> Vec<usize> {
        let params = Self::read_config_params();
        vec![3 + params.max_msg_size / 16]
    }

    fn instances(&self) -> Vec<Vec<Fr>> {
        let mut instances = vec![];
        let commitment_hash = poseidon_hash(&self.commitment);
        println!(
            "commitment hash {}",
            hex::encode(&commitment_hash.to_bytes())
        );
        instances.push(commitment_hash);
        let word = self
            .features
            .iter()
            .zip(self.commitment.iter())
            .zip(self.errors.iter())
            .map(|((f, c), e)| f ^ c ^ e)
            .collect_vec();
        let feature_hash = poseidon_hash(&word);
        println!("feature hash {}", hex::encode(&feature_hash.to_bytes()));
        instances.push(feature_hash);
        let mut message_ext = self.message.to_vec();
        let config_params = Self::read_config_params();
        message_ext.append(&mut vec![
            0;
            config_params.max_msg_size - self.message.len()
        ]);
        let mut packed_message = message_ext
            .chunks(16)
            .map(|bytes| Fr::from_u128(u128::from_le_bytes(bytes.try_into().unwrap())))
            .collect_vec();
        let mut message_public = message_ext
            .iter()
            .map(|byte| Fr::from(*byte as u64))
            .collect_vec();
        let message_hash = poseidon_hash(&[word.to_vec(), message_ext].concat());
        println!("message hash {}", hex::encode(&message_hash.to_bytes()));
        instances.push(message_hash);
        instances.append(&mut packed_message);
        vec![instances]
    }
}

impl DefaultFacialRecoverCircuit {
    pub fn read_config_params() -> DefaultFacialRecoverConfigParams {
        let path = std::env::var(FACIAL_RECOVER_CONFIG_ENV)
            .expect("You should set the configure file path to FACIAL_RECOVER_CONFIG_ENV.");
        let params: DefaultFacialRecoverConfigParams = serde_json::from_reader(
            File::open(path.as_str()).expect(&format!("{} does not exist.", path)),
        )
        .expect("File is found but invalid.");
        params
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use halo2_base::halo2_proofs::{dev::MockProver, halo2curves::bn256::Fr};
    use rand::{seq::SliceRandom, thread_rng, Rng};
    use sha2::{Digest, Sha256};

    #[test]
    fn test_correct1() {
        temp_env::with_var(
            FACIAL_RECOVER_CONFIG_ENV,
            Some("./configs/test1_circuit.config"),
            || {
                let vec_len = 140 * 8;
                let hamming_weight = 90;
                let features_bits = gen_random_vec_bits(vec_len);
                let word_bits = gen_random_vec_bits(vec_len);
                let error_bits = gen_error_term_bits(hamming_weight, vec_len);
                let commitment_bits = features_bits
                    .iter()
                    .zip(word_bits.iter())
                    .zip(error_bits.iter())
                    .map(|((f, w), e)| f ^ w ^ e)
                    .collect_vec();
                let features_bytes = bool_slice_to_le_bytes(&features_bits);
                println!("features_bytes {}", hex::encode(&features_bytes));
                let word_bytes = bool_slice_to_le_bytes(&word_bits);
                println!("word_bytes {}", hex::encode(&word_bytes));
                let error_bytes = bool_slice_to_le_bytes(&error_bits);
                println!("error_bytes {}", hex::encode(&error_bytes));
                let commitment_bytes = bool_slice_to_le_bytes(&commitment_bits);
                println!("commitment_bytes {}", hex::encode(&commitment_bytes));
                let message = b"Sigrid".to_vec();
                let circuit = DefaultFacialRecoverCircuit {
                    features: features_bytes,
                    errors: error_bytes,
                    commitment: commitment_bytes,
                    message,
                };
                let instance = circuit.instances();
                let prover = MockProver::run(20, &circuit, instance).unwrap();
                assert_eq!(prover.verify(), Ok(()));
            },
        );
    }

    fn gen_random_vec_bits(vec_len: usize) -> Vec<bool> {
        let mut rng = rand::thread_rng();
        let mut result = vec![false; vec_len];
        for i in 0..vec_len {
            result[i] = rng.gen();
        }
        result
    }

    fn gen_error_term_bits(hamming_weight: usize, vec_len: usize) -> Vec<bool> {
        let mut rng = rand::thread_rng();
        let mut result = vec![false; vec_len];
        for i in 0..hamming_weight {
            result[i] = true;
        }
        result.shuffle(&mut rng);
        result
    }

    fn bool_slice_to_le_bytes(bool_slice: &[bool]) -> Vec<u8> {
        let mut result = vec![];
        for i in (0..bool_slice.len()).step_by(8) {
            let mut byte = 0u8;
            for j in 0..8 {
                if bool_slice[i + j] {
                    byte |= 1 << j;
                }
            }
            result.push(byte);
        }
        result
    }
}
