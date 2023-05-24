#![cfg_attr(not(feature = "std"), no_std)]

pub use self::content::{
    ContentInfo
};

/**
 * Content コントラクト
 */
#[ink::contract]
mod content {

    use ink::storage::{
        Mapping,
    };
    
    use ink::prelude::string::String;
    use ink::prelude::vec::Vec;
    use ink::prelude::string::ToString;
    use ink::prelude::vec;
    
    /**
     * コンテンツ情報を取り扱うStruct
     */
    #[derive(Clone, Default, scale::Encode, scale::Decode)]
    #[cfg_attr(
        feature = "std",
        derive(Debug, PartialEq, Eq, scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct ContentInfo {
        content_id: u64,
        title: String,
        intro: String,
        content: String,
        goods: u64,
        statement: String,
        quizs: Vec<String>,
        answer: u8,
        image_url: String,
        nft_address: String,
        creator_address: String,
    }

    #[ink(storage)]
    #[derive(Default)]
    pub struct Content {
        contents: Mapping<u64, ContentInfo>,
        content_last_id: u64
    }

    /**
     * methods of Cotent contract
     */
    impl Content {
        
        /**
         * intilize method
         */
        #[ink(constructor, payable)]
        pub fn new() -> Self {
            let first_id: u64 = 0;
            let first_content: ContentInfo = ContentInfo {
                content_id: first_id,
                title: "WASM Learning Course".to_string(),
                intro: "This course is designed to learn about WASM.".to_string(),
                content: "
                    <h2 id='wasmとは' className='underline'>About WASM</h2>
                    <p>An environment in which WebAssembly code can be executed.</p>
                    <h3 id='webassembly-とは' className='underline'>Abount WebAssembly </h3>
                    <p>WebAssembly is a technology for executing languages other than JavaScript in the browser.</p>
                    <p>A binary-format execution environment for stack-based virtual machines. ISA for virtual machines, which can run on any physical machine (i.e., OS-independent); W3C recommendation; also developed by Mozira, Google, etc.</p>
                    <h3 id='バイナリ・フォーマットとは' className='underline'>About binary format</h3>
                    <p>Like text formats, it is not possible to read and write data in a text editor without depending on a specific environment, but instead the data recording method can be determined arbitrarily by the program, allowing information to be structured efficiently.</p>
                    <h3 id='wasiwebassembly-system-interfaceとは' className='underline'>About WASI(WebAssembly System Interface)</h3>
                    <p>Before introducing the WebAssembly Runtime used in the blockchain, we will introduce WASI, a standardization effort for using WebAssembly outside of the Web.</p>
                    <p>WASI stands for WebAssembly System Interface, a specification for providing access to OS features such as the host file system and networking in order to run WebAssembly in an environment other than a browser, as recommended by the W3C.</p>
                    <h3 id='なぜスマートコントラクトにwebassemblyを対応するのか？' className='underline'>Why WebAssembly support for smart contracts?</h3>
                    <ul className='list-disc'>
                        <li>1. High performance. Built to be platform independent and as close to native machine code as possible.</li>
                        <li>2. Small size. Small binaries can be distributed over the Internet to devices with slow Internet connections. This is perfect for the space-constrained blockchain world.</li>
                        <li>3. The advantages are that many tools are available and large companies are investing a lot of resources in promoting Wasm development.Efficient JIT execution Support for 64-bit and 32-bit integer arithmetic with one-to-one correspondence to CPU instructions.</li>
                        <li>4. Minimalism. formal specifications that fit on one page.</li>
                        <li>5. Deterministic Execution Wasm can easily be made deterministic by removing the floating point operations required for the consensus algorithm.</li>
                        <li>6. Open Standards > Custom Solutions.Wasm is a web browser standard developed by a W3C workgroup that includes Google, Mozilla, etc. Both compilers and standards teams have been working on Wasm for years.</li>
                        <li>7. Many languages are available; Wasm expands the family of languages available to smart contract developers to include Rust, C/C++, C#, Typescript, Haxe, and Kotlin. This means that smart contracts can be written in any language with which you are familiar.</li>
                        <li>8. Memory-safe, sandboxed, platform-independent.</li>
                        <li>9. LLVM support. supported by the LLVM Compiler Infrastructure Project, Wasm has benefited from over a decade of LLVM compiler optimizations.</li>
                        <li>10. Large companies involved Continuous development by major companies such as Google, Apple, Microsoft, Mozilla, and Facebook.</li>
                    </ul>
                    <h3 id='astarにおけるwasmコントラクト開発言語' className='underline'>WASM contract development language in Astar</h3>
                    <ul className='list-disc'>
                        <li>!ink</li>
                        <li>!ask</li>
                    </ul>
                    <h3 id='astarにおけるwasmコントラクトの開発フレームワーク' className='underline'>Development framework for WASM contracts in Astar</h3>
                    <ul className='list-disc'>
                        <li>swanky</li>
                    </ul>
                    ".to_string(),
                goods: 0,
                statement: "Which of the following options is NOT a correct programming language for developing WASM-compliant smart contracts?".to_string(),
                quizs: vec![
                    "!ink".to_string(),
                    "!ask".to_string(),
                    "Solidity".to_string(),
                ],
                answer: 2,
                image_url: "/WasmContent.jpeg".to_string(),
                nft_address: "ZjCB8QVKytLmGRGXVCHCuUMnMiQTWU2V3696zqnQiD9kjMg".to_string(),
                creator_address: "5DwLfNQqkLpDoKkHqZCC4EMcFjkn2sbEzqF3JVCZHx6zHoqq".to_string(),
            };

            // init data
            let mut contents = Mapping::default();
            contents.insert(first_id, &first_content);

            Self {
                contents,
                content_last_id: first_id,
            }
        }

        /**
         * intilize method2
         */
        #[ink(constructor, payable)]
        pub fn default() -> Self {
            let first_id: u64 = 0;
            let first_content: ContentInfo = ContentInfo {
                content_id: first_id,
                title: "Sample title".to_string(),
                intro: "Sample introduction".to_string(),
                content: "Sample content".to_string(),
                goods: 0,
                statement: "".to_string(),
                quizs: vec![
                    "Sample question 1".to_string(),
                    "Sample question 2".to_string(),
                    "Sample question 3".to_string(),
                ],
                answer: 1,
                image_url: "https://example.com/sample_image.png".to_string(),
                nft_address: "a6WkJRaZcy6cVkvRQmRmd1TVhAc1Dfq3d7cmpGUjjn9736d".to_string(),
                creator_address: "5DwLfNQqkLpDoKkHqZCC4EMcFjkn2sbEzqF3JVCZHx6zHoqq".to_string(),
            };

            // init data
            let mut contents = Mapping::default();
            contents.insert(first_id, &first_content);

            Self {
                contents,
                content_last_id: first_id,
            }
        }

        /**
         * get selected Content
         */
        #[ink(message)]
        pub fn getContent(&mut self, id: u64) -> ContentInfo {
            // get content info
            self.contents.get(&id).clone().unwrap()
        }

        /**
         * get all Contents 
         */
        #[ink(message)]
        pub fn getContents(&mut self) -> Vec<ContentInfo> {
            let mut contents_info: Vec<ContentInfo> = Vec::new();
            let current_last_id = self.content_last_id;

            // get all content data
            for id in 0..=current_last_id {
                if let Some(content) = self.contents.get(&id) {
                    contents_info.push(content);
                }
            } 
             
            contents_info
        }

        /**
         * create content
         */
        #[ink(message)]
        pub fn createContent(
            &mut self,
            title: String,
            intro: String,
            content :String,
            statement: String,
            quizs: Vec<String>,
            answer: u8,
            url: String,
            nft: String,
            creator: String
        ) -> Result<(), ()> {
            // increment
            self.content_last_id += 1;
            // create content info
            let content_info = ContentInfo {
                content_id: self.content_last_id,
                title,
                intro,
                content,
                goods: 0,
                statement,
                quizs,
                answer,
                image_url: url,
                nft_address: nft,
                creator_address: creator,
            };

            // push
            self.contents.insert(self.content_last_id, &content_info);

            Ok(())
        }

        /**
         * set image url
         */
        #[ink(message)]
        pub fn setImageUrl(&mut self, id:u64, new_url:String) -> Result<(), ()> {
            // get current content info
            let mut new_content = self.contents.get(&id).unwrap();
            // update image url
            new_content.image_url = new_url;
            self.contents.insert(&id, &new_content);

            Ok(())
        }

        /**
         * get imaget url
         */
        #[ink(message)]
        pub fn getImageUrl(&mut self, id:u64) -> String {
            // get get image url info
            let content = self.contents.get(&id).unwrap();
            content.image_url.clone()
        }

        /**
         * get intro
         */
        #[ink(message)]
        pub fn getIntro(&mut self, id:u64) -> String {
            // get get intro info
            let content = self.contents.get(&id).unwrap();
            content.intro.clone()
        }

        /**
         * add good
         */
        #[ink(message)]
        pub fn addGood(&mut self, id:u64) -> Result<(), ()> {
            // get current content info
            let mut new_content = self.contents.get(&id).unwrap();
            // get current good
            let mut new_good = new_content.goods + 1;
            // increment good
            new_content.goods = new_good;
            // insert
            self.contents.insert(&id, &new_content);

            Ok(())
        }
    }

    /**
     * Test Code
     */
    #[cfg(test)]
    mod tests {
        /// Imports all the definitions from the outer scope so we can use them here.
        use super::*;
        use ink::env::debug_println;

        const MAX_MESSAGE_SIZE: usize = 1024;

        /// We test if the default constructor does its job.
        #[ink::test]
        fn default_works() {
            let content = Content::new();

            debug_println!(
                "content: {:?}",
                content
            );
        }

        #[ink::test]
        fn get_contents() {
            let mut content = Content::new();
            let contents = content.getContents();
            assert_eq!(contents.len(), 1);
        }

        #[ink::test]
        fn get_imageUrl() {
            let mut content = Content::new();
            let url:String = content.getImageUrl(0);
            assert_eq!(url, "https://example.com/sample_image.png".to_string());
        }

        #[ink::test]
        fn get_imageIntro() {
            let mut content = Content::new();
            let intro:String = content.getIntro(0);
            assert_eq!(intro, "Sample introduction".to_string());
        }

        #[ink::test]
        fn test_create_content() {
            let mut my_content = Content::new();

            let title = "Sample title".to_owned();
            let intro = "Sample intro".to_owned();
            let content = "Sample content".to_owned();
            let statement = "Sample statement".to_owned();
            let quizs = vec![
                "What is 1+1?".to_owned(),
                "What is the capital of Japan?".to_owned(),
            ];
            let answer = 0;
            let url = "https://example.com/sample.png".to_owned();
            let nft = "0x1234567890abcdef".to_owned();
            let creator = "0x0987654321fedcba".to_owned();
            // create new content
            my_content.createContent(
                title.clone(),
                intro.clone(),
                content.clone(),
                statement.clone(),
                quizs.clone(),
                answer,
                url.clone(),
                nft.clone(),
                creator.clone(),
            );
            // content data
            let content_info = ContentInfo {
                content_id: 0,
                title,
                intro,
                content,
                goods: 0,
                statement,
                quizs,
                answer,
                image_url: url,
                nft_address: nft,
                creator_address: creator,
            };
            
            assert_eq!(my_content.contents.get(&0), Some(content_info));
        }
    }
}