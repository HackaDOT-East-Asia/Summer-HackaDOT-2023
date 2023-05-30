# Project Cyborg

## Demo

<!--- TODO: update --->
[Cyborg PoC Demo video](https://youtu.be/sSNg0Q_DJyk)

## Description

# Introduction



Cyborg network is a decentralized edge computing platform that leverages blockchain to enable IoT sensors and gateways with low-latency data processing and transmission, while offering improved storage and a distributed architecture for increased security and transparency. With a blockchain-based approach, the platform provides superior data governance, privacy, and incentives for edge server providers, making it a secure and decentralized solution for any individual or project in need of edge servers.



#Inspiration



Our team was motivated by a shared vision of leveraging blockchain technology to create practical applications in the real world. We are passionate about decentralized computing and recognize the immense potential of edge computing, which served as the inspiration behind the development of the Cyborg network.



#Current Problems



The problem lies in the potential risks associated with centralized providers in edge computing, including the extraction of excessive value and the hoarding of user data. This leads to market distortion and an alarming concentration of power and control. To address this issue, there is a need to develop decentralized systems that prioritize user control and transparency while ensuring the fair and secure distribution of computing resources.



#Our Solution

Cyborg Network is a revolution in edge computing. It introduces a decentralized approach that empowers users by giving them control over their data and computing resources. Through smart edge tracking and cryptographic encryption, the network automates app deployment, placing a strong emphasis on user-centricity and transparency. This disruptive solution aims to challenge the dominance of centralized providers in the field of edge computing.



#Why is the technology you have used really necessary for us?



We have chosen the General Track by Soonami since our project does not align with any of the other bounty tracks as we are developing on Polkadot and Substrate. The technology we have chosen to use is absolutely necessary for our project due to its unique capabilities and advantages. By developing on Substrate, a powerful framework for building blockchains, we gain a high level of control and flexibility in designing and implementing our application. This allows us to tailor the technology precisely to our project's requirements, ensuring optimal performance and functionality.

Furthermore, we have made the strategic decision to create our own layer 1 Blockchain. This decision is crucial because it enables us to address the inherent challenges in the cloud and edge computing space that arise from centralized infrastructure management. By leveraging a decentralized approach, we can overcome these limitations and establish seamless connectivity between edge servers worldwide.



The technology we are utilizing empowers us to build a cutting-edge platform that revolutionizes the way edge computing operates. It allows us to provide unparalleled connectivity and resource distribution, leading to enhanced performance, improved reliability, and greater user control. By harnessing the capabilities of this technology, we are confident in our ability to deliver a truly transformative solution for the edge computing industry.



#How we built it



In this hackathon, our presentation revolves around a Proof of Concept (PoC) that focuses on publishing data from an edge server to a substrate blockchain. To achieve this, we utilize the off-chain worker module, which enables the blockchain to accept extrinsics from an external HTTP endpoint. Our team has already developed a low-level client software using Rust specifically for Linux Kernel devices. This software empowers us to host these devices as edge servers within the blockchain infrastructure.



Tools used: Substrate, Rust, Javascript.



#Challenges we ran into



The most significant hurdle we encountered was establishing connectivity between a remote device and the Blockchain as an Edge server. This presented a unique challenge as the Edge server differed from a regular node and instead operated as a lightweight client. To overcome this obstacle, we devised a solution where the Edge server receives API requests through a web socket connection from the Blockchain.



#Accomplishments that we're proud of



Our team has successfully finalized the development of a resilient low-level client software written in Rust. This software has been optimized to run efficiently on various devices, including smaller ones like Raspberry Pi. It exposes data based on API calls, allowing seamless integration with other systems.

Additionally, we have introduced a new pallet in Substrate called "Edge Connect." This pallet enables the writing of data from an edge server directly to the Blockchain. It serves as a crucial component in facilitating the connectivity between edge servers and the Blockchain.

Furthermore, we have implemented a server implementation in Rust. This server communicates with all connected clients, sending API requests and collecting their responses. The responses are then posted to a specified HTTP endpoint, ensuring efficient data transmission and retrieval.



We are presenting the Edge Connect pallet for this hackathon.



#What we have learned



Through our journey, we have gained valuable insights into the security risks involved in relying on off-chain workers as trusted data sources for writing to the Blockchain. As a result, we have made a strategic decision to shift our focus towards establishing direct connections between servers and the blockchain. This approach entails interacting with the blockchain through extrinsic calls, eliminating the requirement for a server interface to facilitate communication between blockchains and edge servers. This shift in methodology aims to enhance security and streamline the interaction process, ensuring a more robust and efficient integration between the blockchain and edge servers.

## How to run

### Build Cyborg Node

### Build Cyberhub

### Build Cyborg Smart Client

<!--- TODO: update --->

## About Cyborg Team

Our team members [...]

* Barath Kanna ([Github](https://github.com/)) : Remote edge server, backend API, integration
* Kresna Sucandra ([Github](https://github.com/SHA888)) : Substrate nodes, pallet, offchain worker, runtime
* Megha Varshini ([Github](https://github.com/)) : Operational, Education, Media
