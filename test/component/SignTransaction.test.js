'use strict'

const expect = require('chai').expect
const solc = require('solc')
const config = require('../config')

describe('Sign and Broadcast transaction :: ', () => {

  const SampleContract = `
contract SampleContract {
  function add(int a, int b) constant returns (int sum) {
    sum = a + b;
  }
}
  `

  const compiled = solc.compile(SampleContract, 1).contracts['SampleContract']
  const abi = JSON.parse(compiled.interface)

  const tx = {
    address: '',
    data: compiled.bytecode.toUpperCase(),
    fee: 12,
    gas_limit: 223,
    input: {
      address: config.account.address,
      amount: 100,
      sequence: 9
    }
  }

  const txForSigning = {
    chain_id: '',
    tx: [
      2, {
        address: tx.address,
        data: tx.data,
        fee: tx.fee,
        gas_limit: tx.gas_limit,
        input: {
          address: tx.input.address,
          amount: tx.input.amount,
          sequence: tx.input.sequence
        }
      }
    ]
  }

  before(() => {
    return global.erisdb
      .blockchain
      .getChainId()
      .then((chainId) => {
        txForSigning.chain_id = chainId
      })
  })

  it('should sign transaction', () => {
    return global.erisdb
      .transactions
      .sign(txForSigning, config.account.privKey)
      .then((signed) => {
        expect(signed).to.be.an('array')
          .and.to.have.lengthOf(2)

        tx.input.signature = signed
        // Adding public key
        tx.input.pub_key = [1, config.account.pubKey]
      })
  })

  it('should broadcastTx', () => {
    return global.erisdb
      .transactions
      .broadcastTx(tx)
      .then((info) => {
        expect(info).to.be.an('object')
          .and.to.contain.all.keys([
            'tx_hash', 'creates_contract', 'contract_addr'
          ])
      })
  })
})
