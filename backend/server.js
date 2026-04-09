const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const rateLimit = require('express-rate-limit');
const { Blockchain } = require('./blockchain');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize blockchain
const blockchain = new Blockchain();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later' }
});
app.use('/api/', limiter);

// Helper: generate content hash from text
function generateContentHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

// ─── ROUTES ──────────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET /api/chain - full blockchain
app.get('/api/chain', (req, res) => {
  try {
    const chain = blockchain.getChain();
    const validity = blockchain.isChainValid();
    res.json({ chain, validity, length: chain.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stats - blockchain statistics
app.get('/api/stats', (req, res) => {
  try {
    const stats = blockchain.getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/disclosures - all disclosures
app.get('/api/disclosures', (req, res) => {
  try {
    const { page = 1, limit = 10, aiUsed, search } = req.query;
    let disclosures = blockchain.getAllDisclosures();

    // Filter by aiUsed
    if (aiUsed !== undefined) {
      const aiUsedBool = aiUsed === 'true';
      disclosures = disclosures.filter(d => d.disclosure.aiUsed === aiUsedBool);
    }

    // Search by title, author, or content hash
    if (search) {
      const q = search.toLowerCase();
      disclosures = disclosures.filter(d =>
        (d.disclosure.title && d.disclosure.title.toLowerCase().includes(q)) ||
        (d.disclosure.author && d.disclosure.author.toLowerCase().includes(q)) ||
        (d.disclosure.contentHash && d.disclosure.contentHash.includes(q))
      );
    }

    // Reverse for newest first
    disclosures = disclosures.reverse();

    // Paginate
    const total = disclosures.length;
    const start = (Number(page) - 1) * Number(limit);
    const paginated = disclosures.slice(start, start + Number(limit));

    res.json({
      disclosures: paginated,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/disclosures - create new disclosure
app.post('/api/disclosures', (req, res) => {
  try {
    const {
      content,
      title,
      author,
      contentType,
      aiUsed,
      aiTools,
      aiPercentage,
      humanEditPercentage,
      description,
      aiUsageDetails,
      license
    } = req.body;

    // Validation
    if (!content && !title) {
      return res.status(400).json({ error: 'Either content or title is required' });
    }
    if (aiUsed === undefined || aiUsed === null) {
      return res.status(400).json({ error: 'aiUsed field is required' });
    }

    const contentHash = generateContentHash(content || title + (description || ''));
    const disclosureId = uuidv4();

    const disclosureData = {
      type: 'DISCLOSURE',
      disclosureId,
      contentHash,
      title: title || 'Untitled',
      author: author || 'Anonymous',
      contentType: contentType || 'text',
      aiUsed: Boolean(aiUsed),
      aiTools: aiTools || [],
      aiPercentage: aiUsed ? (aiPercentage || 0) : 0,
      humanEditPercentage: humanEditPercentage || 0,
      description: description || '',
      aiUsageDetails: aiUsageDetails || '',
      license: license || 'All Rights Reserved',
      submittedAt: new Date().toISOString(),
      version: 1
    };

    const block = blockchain.addDisclosureBlock(disclosureData);

    res.status(201).json({
      success: true,
      message: 'Disclosure recorded on blockchain',
      blockHash: block.hash,
      blockIndex: block.index,
      disclosureId,
      contentHash,
      timestamp: block.timestamp
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/verify/:blockHash - verify a specific disclosure
app.get('/api/verify/:blockHash', (req, res) => {
  try {
    const { blockHash } = req.params;
    const block = blockchain.getDisclosureByBlockHash(blockHash);

    if (!block) {
      return res.status(404).json({ error: 'Block not found', verified: false });
    }

    const recalculated = block.calculateHash();
    const chainValidity = blockchain.isChainValid();
    const hashMatch = recalculated === block.hash;

    res.json({
      verified: hashMatch && chainValidity.valid,
      blockFound: true,
      hashIntegrity: hashMatch,
      chainIntegrity: chainValidity.valid,
      block: {
        index: block.index,
        hash: block.hash,
        previousHash: block.previousHash,
        timestamp: block.timestamp,
        nonce: block.nonce,
        data: block.data
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/verify/content - verify content by hash
app.post('/api/verify/content', (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content required' });

    const contentHash = generateContentHash(content);
    const blocks = blockchain.getDisclosureByContentHash(contentHash);

    res.json({
      contentHash,
      found: blocks.length > 0,
      disclosures: blocks.map(b => ({
        blockIndex: b.index,
        blockHash: b.hash,
        timestamp: b.timestamp,
        disclosure: b.data
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/disclosures/:disclosureId - get specific disclosure
app.get('/api/disclosures/:disclosureId', (req, res) => {
  try {
    const { disclosureId } = req.params;
    const all = blockchain.getAllDisclosures();
    const found = all.filter(d => d.disclosure.disclosureId === disclosureId);

    if (!found.length) {
      return res.status(404).json({ error: 'Disclosure not found' });
    }

    res.json({ disclosure: found[0], history: found });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🔗 Blockchain AI Disclosure Server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log(`⛓️  Genesis block hash: ${blockchain.getLatestBlock().hash}\n`);
});

module.exports = app;
