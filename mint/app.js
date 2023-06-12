const express = require('express')
const {utils} = require('ethers')
const fs = require('fs')
const {MerkleTree} = require('merkletreejs')
const keccak256 = require('keccak256')


const app = express()
app.use(express.static('build'))



const padBuffer = (addr) => {
    return Buffer.from(addr.substr(2).padStart(32*2, 0), 'hex')
}

let content = fs.readFileSync('wl.txt').toString()
let wls = content.split('\n').map(e=>e.trim())
let leafs = wls.map(keccak256)
let merkleTree = new MerkleTree(leafs, keccak256, {sortPairs:true})

let proof = [
    "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
    "0xe59071ff940f1b72b01db7ee5c6eb867c398169891c9fe3ad69541e28e623efe",
    "0xa48c514fdacafb50525dfea49eb0cc245cb3eabb1dfb3fb286d8102708d17686",
    "0xda8190513bedffd6c3fb87eacd9587c315ddee9d6b617a8a3f9959599f687156",
    "0x1b595ece333ca3ccf5dc068b68051a80944069fe71a47bc7414262d6336d643a"
]

console.log(merkleTree.getRoot().toString('hex'))
console.log(merkleTree.verify(proof, keccak256('0xA8E22d51239aA2C18B1411537383FE997cFf067b'), merkleTree.getRoot()))


// 获取当前用户的地址
const signerAddress = '0xA8E22d51239aA2C18B1411537383FE997cFf067b';

// 将地址进行紧密打包
const packedData = utils.defaultAbiCoder.encode(['address'], [signerAddress]);

// 计算紧密打包后的数据的 Keccak-256 哈希值
const hash = utils.solidityKeccak256(['address'], [signerAddress]);
console.log(hash);
console.log(keccak256(signerAddress).toString('hex'));
app.get('/proof/:address', (req, res)=>{
    let address = req.params.address
    //console.log(address)
    let proof = merkleTree.getHexProof(keccak256(address))
    //console.log(proof)
    res.send(proof)
})

app.listen(1224, ()=> {
    console.log('start')
})
