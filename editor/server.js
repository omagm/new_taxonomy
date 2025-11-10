import express from 'express';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataDir = join(__dirname, '..', 'data');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// Helper to read JSON files
function readData(filename) {
  const path = join(dataDir, filename);
  return JSON.parse(readFileSync(path, 'utf-8'));
}

// Helper to write JSON files
function writeData(filename, data) {
  const path = join(dataDir, filename);
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
}

// GET all data endpoint - returns all data for the editor
app.get('/api/data', (req, res) => {
  try {
    const data = {
      categories: readData('categories.json'),
      specificationGroups: readData('specification-groups.json'),
      specifications: readData('specifications.json'),
      enumOptions: readData('enum-options.json'),
      models: readData('models.json'),
      machines: readData('machines.json'),
      specificationPresets: readData('specification-presets.json'),
      machineModelInstances: readData('machine-model-instances.json'),
      machineSpecificationValues: readData('machine-specification-values.json')
    };
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CRUD endpoints for categories
app.post('/api/categories', (req, res) => {
  try {
    const categories = readData('categories.json');
    const newCategory = {
      ...req.body,
      uid: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    categories.push(newCategory);
    writeData('categories.json', categories);
    res.json(newCategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/categories/:uid', (req, res) => {
  try {
    const categories = readData('categories.json');
    const index = categories.findIndex(c => c.uid === req.params.uid);
    if (index === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }
    categories[index] = {
      ...categories[index],
      ...req.body,
      uid: req.params.uid,
      updated_at: new Date().toISOString()
    };
    writeData('categories.json', categories);
    res.json(categories[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/categories/:uid', (req, res) => {
  try {
    const categories = readData('categories.json');
    const filtered = categories.filter(c => c.uid !== req.params.uid);
    if (filtered.length === categories.length) {
      return res.status(404).json({ error: 'Category not found' });
    }
    writeData('categories.json', filtered);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CRUD endpoints for specification groups
app.post('/api/specification-groups', (req, res) => {
  try {
    const groups = readData('specification-groups.json');
    const newGroup = {
      ...req.body,
      uid: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    groups.push(newGroup);
    writeData('specification-groups.json', groups);
    res.json(newGroup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/specification-groups/:uid', (req, res) => {
  try {
    const groups = readData('specification-groups.json');
    const index = groups.findIndex(g => g.uid === req.params.uid);
    if (index === -1) {
      return res.status(404).json({ error: 'Specification group not found' });
    }
    groups[index] = {
      ...groups[index],
      ...req.body,
      uid: req.params.uid,
      updated_at: new Date().toISOString()
    };
    writeData('specification-groups.json', groups);
    res.json(groups[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/specification-groups/:uid', (req, res) => {
  try {
    const groups = readData('specification-groups.json');
    const filtered = groups.filter(g => g.uid !== req.params.uid);
    if (filtered.length === groups.length) {
      return res.status(404).json({ error: 'Specification group not found' });
    }
    writeData('specification-groups.json', filtered);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CRUD endpoints for specifications
app.post('/api/specifications', (req, res) => {
  try {
    const specifications = readData('specifications.json');
    const newSpec = {
      ...req.body,
      uid: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    specifications.push(newSpec);
    writeData('specifications.json', specifications);
    res.json(newSpec);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/specifications/:uid', (req, res) => {
  try {
    const specifications = readData('specifications.json');
    const index = specifications.findIndex(s => s.uid === req.params.uid);
    if (index === -1) {
      return res.status(404).json({ error: 'Specification not found' });
    }
    specifications[index] = {
      ...specifications[index],
      ...req.body,
      uid: req.params.uid,
      updated_at: new Date().toISOString()
    };
    writeData('specifications.json', specifications);
    res.json(specifications[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/specifications/:uid', (req, res) => {
  try {
    const specifications = readData('specifications.json');
    const filtered = specifications.filter(s => s.uid !== req.params.uid);
    if (filtered.length === specifications.length) {
      return res.status(404).json({ error: 'Specification not found' });
    }
    writeData('specifications.json', filtered);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CRUD endpoints for enum options
app.post('/api/enum-options', (req, res) => {
  try {
    const options = readData('enum-options.json');
    const newOption = {
      ...req.body,
      uid: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    options.push(newOption);
    writeData('enum-options.json', options);
    res.json(newOption);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/enum-options/:uid', (req, res) => {
  try {
    const options = readData('enum-options.json');
    const index = options.findIndex(o => o.uid === req.params.uid);
    if (index === -1) {
      return res.status(404).json({ error: 'Enum option not found' });
    }
    options[index] = {
      ...options[index],
      ...req.body,
      uid: req.params.uid,
      updated_at: new Date().toISOString()
    };
    writeData('enum-options.json', options);
    res.json(options[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/enum-options/:uid', (req, res) => {
  try {
    const options = readData('enum-options.json');
    const filtered = options.filter(o => o.uid !== req.params.uid);
    if (filtered.length === options.length) {
      return res.status(404).json({ error: 'Enum option not found' });
    }
    writeData('enum-options.json', filtered);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Taxonomy Editor running on http://localhost:${PORT}`);
});
