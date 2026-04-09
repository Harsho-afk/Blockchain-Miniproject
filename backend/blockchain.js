const crypto = require('crypto');

class Block {
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(
        this.index +
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.data) +
        this.nonce
      )
      .digest('hex');
  }

  mineBlock(difficulty) {
    const target = Array(difficulty + 1).join('0');
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log(`Block mined: ${this.hash}`);
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingDisclosures = [];
  }

  createGenesisBlock() {
    return new Block(
      0,
      new Date().toISOString(),
      {
        type: 'GENESIS',
        message: 'AI Content Disclosure Blockchain - Genesis Block',
        system: 'Blockchain-Based AI Content Disclosure System v1.0'
      },
      '0'
    );
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addDisclosureBlock(disclosureData) {
    const block = new Block(
      this.chain.length,
      new Date().toISOString(),
      disclosureData,
      this.getLatestBlock().hash
    );
    block.mineBlock(this.difficulty);
    this.chain.push(block);
    return block;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return { valid: false, reason: `Block ${i} hash mismatch`, blockIndex: i };
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return { valid: false, reason: `Block ${i} previous hash mismatch`, blockIndex: i };
      }
    }
    return { valid: true, reason: 'Chain is valid' };
  }

  getDisclosureByContentHash(contentHash) {
    const results = [];
    for (const block of this.chain) {
      if (block.data && block.data.contentHash === contentHash) {
        results.push(block);
      }
    }
    return results;
  }

  getDisclosureByBlockHash(blockHash) {
    return this.chain.find(b => b.hash === blockHash) || null;
  }

  getAllDisclosures() {
    return this.chain
      .filter(b => b.data && b.data.type !== 'GENESIS')
      .map(b => ({
        blockIndex: b.index,
        blockHash: b.hash,
        previousHash: b.previousHash,
        timestamp: b.timestamp,
        nonce: b.nonce,
        disclosure: b.data
      }));
  }

  getStats() {
    const disclosures = this.getAllDisclosures();
    const aiUsedCount = disclosures.filter(d => d.disclosure.aiUsed === true).length;
    const humanOnlyCount = disclosures.filter(d => d.disclosure.aiUsed === false).length;

    const toolCounts = {};
    disclosures.forEach(d => {
      if (d.disclosure.aiTools) {
        d.disclosure.aiTools.forEach(tool => {
          toolCounts[tool] = (toolCounts[tool] || 0) + 1;
        });
      }
    });

    return {
      totalBlocks: this.chain.length,
      totalDisclosures: disclosures.length,
      aiUsedCount,
      humanOnlyCount,
      topAiTools: Object.entries(toolCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tool, count]) => ({ tool, count })),
      chainValid: this.isChainValid().valid
    };
  }

  getChain() {
    return this.chain;
  }
}

module.exports = { Blockchain, Block };
