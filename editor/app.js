// Global state
let data = {
  categories: [],
  specificationGroups: [],
  specifications: [],
  enumOptions: [],
  models: [],
  machines: [],
  specificationPresets: [],
  machineModelInstances: [],
  machineSpecificationValues: []
};

let editingItem = null;
let editingType = null;

// Initialize app
async function init() {
  await loadData();
  renderTree();
  setupEventListeners();
}

// Load all data from server
async function loadData() {
  try {
    const response = await fetch('/api/data');
    data = await response.json();
  } catch (error) {
    console.error('Failed to load data:', error);
    alert('Failed to load data. Please refresh the page.');
  }
}

// Setup event listeners
function setupEventListeners() {
  document.getElementById('refresh-btn').addEventListener('click', async () => {
    await loadData();
    renderTree();
  });

  const modal = document.getElementById('modal');
  document.querySelector('.close').addEventListener('click', () => {
    modal.classList.remove('active');
  });

  document.getElementById('cancel-btn').addEventListener('click', () => {
    modal.classList.remove('active');
  });

  document.getElementById('edit-form').addEventListener('submit', handleFormSubmit);

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
}

// Render the tree structure
function renderTree() {
  const container = document.getElementById('tree-container');
  container.innerHTML = '';

  // Get root categories (those without parent_category_uid)
  const rootCategories = data.categories
    .filter(c => !c.parent_category_uid)
    .sort((a, b) => (b.position_rank || 0) - (a.position_rank || 0));

  rootCategories.forEach(category => {
    container.appendChild(renderCategory(category, true));
  });
}

// Render a category node
function renderCategory(category, isRoot = false) {
  const node = document.createElement('div');
  node.className = `tree-node ${isRoot ? 'root' : ''}`;

  // Get child categories
  const childCategories = data.categories
    .filter(c => c.parent_category_uid === category.uid)
    .sort((a, b) => (b.position_rank || 0) - (a.position_rank || 0));

  // Get spec groups for this category
  const specGroups = data.specificationGroups
    .filter(sg => sg.category_uid === category.uid)
    .sort((a, b) => (b.position_rank || 0) - (a.position_rank || 0));

  const hasChildren = childCategories.length > 0 || specGroups.length > 0;

  const header = document.createElement('div');
  header.className = 'node-header';
  header.innerHTML = `
    <span class="toggle ${hasChildren ? 'expanded' : 'empty'}"></span>
    <span class="node-label">
      ${category.label.en}
      ${category.isMetaCategory ? '<span class="meta-category">(Meta)</span>' : ''}
      <span class="position-rank">#${category.position_rank}</span>
    </span>
    <span class="node-type category">Category</span>
    <div class="node-actions">
      <button class="btn btn-small" onclick="editItem('${category.uid}', 'category')">Edit</button>
      <button class="btn btn-small" onclick="addChild('${category.uid}', 'category')">+ Category</button>
      <button class="btn btn-small" onclick="addChild('${category.uid}', 'spec-group')">+ Spec Group</button>
      <button class="btn btn-small btn-danger" onclick="deleteItem('${category.uid}', 'category')">Delete</button>
    </div>
  `;

  const content = document.createElement('div');
  content.className = 'node-content';

  // Add spec groups
  specGroups.forEach(group => {
    content.appendChild(renderSpecGroup(group));
  });

  // Add child categories
  childCategories.forEach(child => {
    content.appendChild(renderCategory(child));
  });

  // Toggle functionality
  const toggle = header.querySelector('.toggle');
  if (hasChildren) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      content.classList.toggle('hidden');
      toggle.classList.toggle('expanded');
      toggle.classList.toggle('collapsed');
    });
  }

  node.appendChild(header);
  node.appendChild(content);
  return node;
}

// Render a specification group node
function renderSpecGroup(group) {
  const node = document.createElement('div');
  node.className = 'tree-node';

  // Get specifications for this group
  const specs = data.specifications
    .filter(s => s.specification_group_uid === group.uid)
    .sort((a, b) => (b.position_rank || 0) - (a.position_rank || 0));

  const hasSpecs = specs.length > 0;

  const header = document.createElement('div');
  header.className = 'node-header';
  header.innerHTML = `
    <span class="toggle ${hasSpecs ? 'expanded' : 'empty'}"></span>
    <span class="node-label">
      ${group.label.en}
      <span class="position-rank">#${group.position_rank}</span>
    </span>
    <span class="node-type spec-group">${group.type}</span>
    <div class="node-actions">
      <button class="btn btn-small" onclick="editItem('${group.uid}', 'spec-group')">Edit</button>
      <button class="btn btn-small" onclick="addChild('${group.uid}', 'specification')">+ Specification</button>
      <button class="btn btn-small btn-danger" onclick="deleteItem('${group.uid}', 'spec-group')">Delete</button>
    </div>
  `;

  const content = document.createElement('div');
  content.className = 'node-content';

  if (hasSpecs) {
    content.appendChild(renderSpecificationsTable(specs));
  }

  // Toggle functionality
  const toggle = header.querySelector('.toggle');
  if (hasSpecs) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      content.classList.toggle('hidden');
      toggle.classList.toggle('expanded');
      toggle.classList.toggle('collapsed');
    });
  }

  node.appendChild(header);
  node.appendChild(content);
  return node;
}

// Render specifications as a table
function renderSpecificationsTable(specs) {
  const table = document.createElement('div');
  table.className = 'specs-table';

  const tableHTML = `
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Type Options</th>
          <th>Flags</th>
          <th>Rank</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${specs.map(spec => {
          const typeOptionsDisplay = renderTypeOptions(spec);
          return `
          <tr>
            <td>
              ${spec.label.en}
              ${spec.type === 'Enum' || spec.type === 'Enum Plus' ?
                `<div style="margin-top: 8px;">${renderEnumOptions(spec.uid)}</div>` :
                ''
              }
            </td>
            <td>${spec.type}</td>
            <td style="font-size: 12px; color: #666;">${typeOptionsDisplay}</td>
            <td>
              ${spec.required ? '<span class="badge required">Required</span>' : ''}
              ${spec.highlighted ? '<span class="badge highlighted">Highlighted</span>' : ''}
            </td>
            <td>${spec.position_rank}</td>
            <td>
              <button class="btn btn-small" onclick="editItem('${spec.uid}', 'specification')">Edit</button>
              ${spec.type === 'Enum' || spec.type === 'Enum Plus' ?
                `<button class="btn btn-small" onclick="addChild('${spec.uid}', 'enum-option')">+ Option</button>` :
                ''
              }
              <button class="btn btn-small btn-danger" onclick="deleteItem('${spec.uid}', 'specification')">Delete</button>
            </td>
          </tr>
        `;
        }).join('')}
      </tbody>
    </table>
  `;

  table.innerHTML = tableHTML;
  return table;
}

// Render type options summary for a specification
function renderTypeOptions(spec) {
  const opts = spec.type_options || {};
  const parts = [];

  switch(spec.type) {
    case 'Text':
      if (opts.max_length) parts.push(`max: ${opts.max_length}`);
      break;

    case 'Enum':
    case 'Enum Plus':
      if (opts.allow_multiple) parts.push('multiple');
      if (opts.hide_name) parts.push('hide name');
      break;

    case 'Numerical':
      if (opts.unit) parts.push(`unit: ${opts.unit}`);
      if (opts.min !== undefined) parts.push(`min: ${opts.min}`);
      if (opts.max !== undefined) parts.push(`max: ${opts.max}`);
      if (opts.num_type) parts.push(opts.num_type);
      break;

    case 'Numerical Range':
      if (opts.range_type) parts.push(opts.range_type);
      if (opts.unit) parts.push(`unit: ${opts.unit}`);
      if (opts.min !== undefined) parts.push(`min: ${opts.min}`);
      if (opts.max !== undefined) parts.push(`max: ${opts.max}`);
      if (opts.num_type) parts.push(opts.num_type);
      break;
  }

  return parts.length > 0 ? parts.join(', ') : '—';
}

// Render enum options for a specification
function renderEnumOptions(specUid) {
  const options = data.enumOptions
    .filter(o => o.specification_uid === specUid);

  if (options.length === 0) {
    return '<span style="color: #999; font-size: 12px;">No options</span>';
  }

  return options.map(opt => `
    <div style="display: flex; align-items: center; gap: 8px; margin: 4px 0; padding: 4px; background: #f9f9f9; border-radius: 3px;">
      <span class="node-type enum-option">Option</span>
      <span style="flex: 1; font-size: 12px;">${opt.label.en}</span>
      <button class="btn btn-small" onclick="editItem('${opt.uid}', 'enum-option')" style="padding: 2px 6px;">Edit</button>
      <button class="btn btn-small btn-danger" onclick="deleteItem('${opt.uid}', 'enum-option')" style="padding: 2px 6px;">Delete</button>
    </div>
  `).join('');
}

// Edit an item
window.editItem = function(uid, type) {
  let item;
  switch(type) {
    case 'category':
      item = data.categories.find(c => c.uid === uid);
      break;
    case 'spec-group':
      item = data.specificationGroups.find(g => g.uid === uid);
      break;
    case 'specification':
      item = data.specifications.find(s => s.uid === uid);
      break;
    case 'enum-option':
      item = data.enumOptions.find(o => o.uid === uid);
      break;
  }

  if (!item) return;

  editingItem = item;
  editingType = type;

  showEditModal(item, type);
};

// Add a child item
window.addChild = function(parentUid, type) {
  let newItem = {
    uid: '', // Will be generated on server
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  switch(type) {
    case 'category':
      newItem.parent_category_uid = parentUid;
      newItem.name = '';
      newItem.label = { en: '' };
      newItem.position_rank = 0;
      newItem.isMetaCategory = false;
      break;
    case 'spec-group':
      newItem.category_uid = parentUid;
      newItem.name = '';
      newItem.label = { en: '' };
      newItem.type = 'Equipment';
      newItem.position_rank = 0;
      break;
    case 'specification':
      newItem.specification_group_uid = parentUid;
      newItem.name = '';
      newItem.label = { en: '' };
      newItem.internal_description = '';
      newItem.type = 'Text';
      newItem.type_options = {};
      newItem.required = false;
      newItem.highlighted = false;
      newItem.position_rank = 0;
      break;
    case 'enum-option':
      newItem.specification_uid = parentUid;
      newItem.name = '';
      newItem.label = { en: '' };
      newItem.manufacturers_using = [];
      newItem.highlighted = false;
      break;
  }

  editingItem = newItem;
  editingType = type;

  showEditModal(newItem, type, true);
};

// Delete an item
window.deleteItem = async function(uid, type) {
  if (!confirm('Are you sure you want to delete this item?')) return;

  try {
    let endpoint;
    switch(type) {
      case 'category':
        endpoint = `/api/categories/${uid}`;
        break;
      case 'spec-group':
        endpoint = `/api/specification-groups/${uid}`;
        break;
      case 'specification':
        endpoint = `/api/specifications/${uid}`;
        break;
      case 'enum-option':
        endpoint = `/api/enum-options/${uid}`;
        break;
    }

    const response = await fetch(endpoint, { method: 'DELETE' });
    if (!response.ok) throw new Error('Delete failed');

    await loadData();
    renderTree();
  } catch (error) {
    console.error('Delete failed:', error);
    alert('Failed to delete item');
  }
};

// Show edit modal
function showEditModal(item, type, isNew = false) {
  const modal = document.getElementById('modal');
  const title = document.getElementById('modal-title');
  const formFields = document.getElementById('form-fields');

  title.textContent = isNew ? `Add New ${type}` : `Edit ${type}`;

  formFields.innerHTML = generateFormFields(item, type);

  // Add event listener for specification type changes
  if (type === 'specification') {
    const typeSelect = document.getElementById('spec-type-select');
    if (typeSelect) {
      typeSelect.addEventListener('change', function() {
        const selectedType = this.value;
        // Hide all type option groups
        document.querySelectorAll('.type-option-group').forEach(group => {
          group.style.display = 'none';
        });
        // Show the relevant type option group
        const relevantGroup = document.querySelector(`.type-option-group[data-type="${selectedType}"]`);
        if (relevantGroup) {
          relevantGroup.style.display = 'block';
        }
      });
    }
  }

  modal.classList.add('active');
}

// Generate form fields based on item type
function generateFormFields(item, type) {
  let fields = '';

  switch(type) {
    case 'category':
      fields = `
        <div class="form-group">
          <label>Name (ID)</label>
          <input type="text" name="name" value="${item.name || ''}" required>
        </div>
        <div class="form-group">
          <label>Label (English)</label>
          <input type="text" name="label_en" value="${item.label?.en || ''}" required>
        </div>
        <div class="form-group">
          <label>Label (German)</label>
          <input type="text" name="label_de" value="${item.label?.de || ''}">
        </div>
        <div class="form-group">
          <label>Label (Spanish)</label>
          <input type="text" name="label_es" value="${item.label?.es || ''}">
        </div>
        <div class="form-group">
          <label>Internal Description</label>
          <textarea name="internal_description">${item.internal_description || ''}</textarea>
        </div>
        <div class="form-group">
          <label>Position Rank</label>
          <input type="number" name="position_rank" value="${item.position_rank || 0}" required>
        </div>
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" name="isMetaCategory" ${item.isMetaCategory ? 'checked' : ''}>
            Is Meta Category
          </label>
        </div>
      `;
      break;

    case 'spec-group':
      fields = `
        <div class="form-group">
          <label>Name (ID)</label>
          <input type="text" name="name" value="${item.name || ''}" required>
        </div>
        <div class="form-group">
          <label>Label (English)</label>
          <input type="text" name="label_en" value="${item.label?.en || ''}" required>
        </div>
        <div class="form-group">
          <label>Label (German)</label>
          <input type="text" name="label_de" value="${item.label?.de || ''}">
        </div>
        <div class="form-group">
          <label>Label (Spanish)</label>
          <input type="text" name="label_es" value="${item.label?.es || ''}">
        </div>
        <div class="form-group">
          <label>Internal Description</label>
          <textarea name="internal_description">${item.internal_description || ''}</textarea>
        </div>
        <div class="form-group">
          <label>Type</label>
          <select name="type" required>
            <option value="Equipment" ${item.type === 'Equipment' ? 'selected' : ''}>Equipment</option>
            <option value="Technical Details" ${item.type === 'Technical Details' ? 'selected' : ''}>Technical Details</option>
          </select>
        </div>
        <div class="form-group">
          <label>Position Rank</label>
          <input type="number" name="position_rank" value="${item.position_rank || 0}" required>
        </div>
      `;
      break;

    case 'specification':
      const typeOptions = item.type_options || {};
      fields = `
        <div class="form-group">
          <label>Name (ID)</label>
          <input type="text" name="name" value="${item.name || ''}" required>
        </div>
        <div class="form-group">
          <label>Label (English)</label>
          <input type="text" name="label_en" value="${item.label?.en || ''}" required>
        </div>
        <div class="form-group">
          <label>Label (German)</label>
          <input type="text" name="label_de" value="${item.label?.de || ''}">
        </div>
        <div class="form-group">
          <label>Label (Spanish)</label>
          <input type="text" name="label_es" value="${item.label?.es || ''}">
        </div>
        <div class="form-group">
          <label>Internal Description</label>
          <textarea name="internal_description" required>${item.internal_description || ''}</textarea>
        </div>
        <div class="form-group">
          <label>Type</label>
          <select name="type" id="spec-type-select" required>
            <option value="Text" ${item.type === 'Text' ? 'selected' : ''}>Text</option>
            <option value="Boolean Plus" ${item.type === 'Boolean Plus' ? 'selected' : ''}>Boolean Plus</option>
            <option value="Enum" ${item.type === 'Enum' ? 'selected' : ''}>Enum</option>
            <option value="Enum Plus" ${item.type === 'Enum Plus' ? 'selected' : ''}>Enum Plus</option>
            <option value="Numerical" ${item.type === 'Numerical' ? 'selected' : ''}>Numerical</option>
            <option value="Numerical Range" ${item.type === 'Numerical Range' ? 'selected' : ''}>Numerical Range</option>
          </select>
        </div>

        <!-- Type Options Section -->
        <div class="type-options-section">
          <h3>Type Options</h3>

          <!-- Text Type Options -->
          <div class="type-option-group" data-type="Text" style="display: ${item.type === 'Text' ? 'block' : 'none'}">
            <div class="form-group">
              <label>Max Length (optional)</label>
              <input type="number" name="type_opt_max_length" value="${typeOptions.max_length || ''}" min="1">
            </div>
          </div>

          <!-- Boolean Plus Type Options -->
          <div class="type-option-group" data-type="Boolean Plus" style="display: ${item.type === 'Boolean Plus' ? 'block' : 'none'}">
            <p class="type-option-note">No additional options for Boolean Plus</p>
          </div>

          <!-- Enum Type Options -->
          <div class="type-option-group" data-type="Enum" style="display: ${item.type === 'Enum' ? 'block' : 'none'}">
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" name="type_opt_allow_multiple" ${typeOptions.allow_multiple ? 'checked' : ''}>
                Allow Multiple Selection
              </label>
            </div>
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" name="type_opt_hide_name" ${typeOptions.hide_name ? 'checked' : ''}>
                Hide Name (show value only)
              </label>
            </div>
          </div>

          <!-- Enum Plus Type Options -->
          <div class="type-option-group" data-type="Enum Plus" style="display: ${item.type === 'Enum Plus' ? 'block' : 'none'}">
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" name="type_opt_allow_multiple" ${typeOptions.allow_multiple ? 'checked' : ''}>
                Allow Multiple Selection
              </label>
            </div>
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" name="type_opt_hide_name" ${typeOptions.hide_name ? 'checked' : ''}>
                Hide Name (show value only)
              </label>
            </div>
          </div>

          <!-- Numerical Type Options -->
          <div class="type-option-group" data-type="Numerical" style="display: ${item.type === 'Numerical' ? 'block' : 'none'}">
            <div class="form-group">
              <label>Unit (optional)</label>
              <input type="text" name="type_opt_unit" value="${typeOptions.unit || ''}" placeholder="e.g., cm, mm, sheets/hour, nameAsUnit">
              <small>Use "nameAsUnit" to display the specification name as unit</small>
            </div>
            <div class="form-group">
              <label>Min Value (optional)</label>
              <input type="number" name="type_opt_min" value="${typeOptions.min !== undefined ? typeOptions.min : ''}" step="any">
            </div>
            <div class="form-group">
              <label>Max Value (optional)</label>
              <input type="number" name="type_opt_max" value="${typeOptions.max !== undefined ? typeOptions.max : ''}" step="any">
            </div>
            <div class="form-group">
              <label>Number Type</label>
              <select name="type_opt_num_type">
                <option value="float" ${typeOptions.num_type === 'float' || !typeOptions.num_type ? 'selected' : ''}>Float (decimals)</option>
                <option value="int" ${typeOptions.num_type === 'int' ? 'selected' : ''}>Integer</option>
              </select>
            </div>
          </div>

          <!-- Numerical Range Type Options -->
          <div class="type-option-group" data-type="Numerical Range" style="display: ${item.type === 'Numerical Range' ? 'block' : 'none'}">
            <div class="form-group">
              <label>Range Type</label>
              <select name="type_opt_range_type" required>
                <option value="from_to" ${typeOptions.range_type === 'from_to' ? 'selected' : ''}>From/To Range (e.g., 10-50cm)</option>
                <option value="two_dimensional" ${typeOptions.range_type === 'two_dimensional' ? 'selected' : ''}>Two Dimensional (e.g., 14x40cm)</option>
                <option value="three_dimensional" ${typeOptions.range_type === 'three_dimensional' ? 'selected' : ''}>Three Dimensional (e.g., 10x20x30cm)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Unit (optional)</label>
              <input type="text" name="type_opt_unit" value="${typeOptions.unit || ''}" placeholder="e.g., cm, mm">
            </div>
            <div class="form-group">
              <label>Min Value (optional)</label>
              <input type="number" name="type_opt_min" value="${typeOptions.min !== undefined ? typeOptions.min : ''}" step="any">
            </div>
            <div class="form-group">
              <label>Max Value (optional)</label>
              <input type="number" name="type_opt_max" value="${typeOptions.max !== undefined ? typeOptions.max : ''}" step="any">
            </div>
            <div class="form-group">
              <label>Number Type</label>
              <select name="type_opt_num_type">
                <option value="float" ${typeOptions.num_type === 'float' || !typeOptions.num_type ? 'selected' : ''}>Float (decimals)</option>
                <option value="int" ${typeOptions.num_type === 'int' ? 'selected' : ''}>Integer</option>
              </select>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Position Rank</label>
          <input type="number" name="position_rank" value="${item.position_rank || 0}" required>
        </div>
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" name="required" ${item.required ? 'checked' : ''}>
            Required
          </label>
        </div>
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" name="highlighted" ${item.highlighted ? 'checked' : ''}>
            Highlighted
          </label>
        </div>
      `;
      break;

    case 'enum-option':
      fields = `
        <div class="form-group">
          <label>Name (ID)</label>
          <input type="text" name="name" value="${item.name || ''}" required>
        </div>
        <div class="form-group">
          <label>Label (English)</label>
          <input type="text" name="label_en" value="${item.label?.en || ''}" required>
        </div>
        <div class="form-group">
          <label>Label (German)</label>
          <input type="text" name="label_de" value="${item.label?.de || ''}">
        </div>
        <div class="form-group">
          <label>Label (Spanish)</label>
          <input type="text" name="label_es" value="${item.label?.es || ''}">
        </div>
        <div class="form-group">
          <label>Internal Description</label>
          <textarea name="internal_description">${item.internal_description || ''}</textarea>
        </div>
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" name="highlighted" ${item.highlighted ? 'checked' : ''}>
            Highlighted
          </label>
        </div>
      `;
      break;
  }

  return fields;
}

// Handle form submission
async function handleFormSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const updatedItem = { ...editingItem };

  // Process form data
  for (let [key, value] of formData.entries()) {
    if (key.startsWith('label_')) {
      const lang = key.replace('label_', '');
      if (!updatedItem.label) updatedItem.label = {};
      updatedItem.label[lang] = value;
    } else if (key === 'position_rank') {
      updatedItem[key] = parseInt(value);
    } else if (key === 'required' || key === 'highlighted' || key === 'isMetaCategory') {
      updatedItem[key] = formData.has(key);
    } else if (key.startsWith('type_opt_')) {
      // Skip type_opt fields in main loop, handle them separately below
      continue;
    } else {
      updatedItem[key] = value;
    }
  }

  // Build type_options object for specifications
  if (editingType === 'specification') {
    updatedItem.type_options = {};

    const specType = updatedItem.type;

    // Text type options
    if (specType === 'Text') {
      const maxLength = formData.get('type_opt_max_length');
      if (maxLength) {
        updatedItem.type_options.max_length = parseInt(maxLength);
      }
    }

    // Enum and Enum Plus type options
    if (specType === 'Enum' || specType === 'Enum Plus') {
      updatedItem.type_options.allow_multiple = formData.has('type_opt_allow_multiple');
      updatedItem.type_options.hide_name = formData.has('type_opt_hide_name');
    }

    // Numerical type options
    if (specType === 'Numerical') {
      const unit = formData.get('type_opt_unit');
      const min = formData.get('type_opt_min');
      const max = formData.get('type_opt_max');
      const numType = formData.get('type_opt_num_type');

      if (unit) updatedItem.type_options.unit = unit;
      if (min !== '') updatedItem.type_options.min = parseFloat(min);
      if (max !== '') updatedItem.type_options.max = parseFloat(max);
      if (numType) updatedItem.type_options.num_type = numType;
    }

    // Numerical Range type options
    if (specType === 'Numerical Range') {
      const rangeType = formData.get('type_opt_range_type');
      const unit = formData.get('type_opt_unit');
      const min = formData.get('type_opt_min');
      const max = formData.get('type_opt_max');
      const numType = formData.get('type_opt_num_type');

      if (rangeType) updatedItem.type_options.range_type = rangeType;
      if (unit) updatedItem.type_options.unit = unit;
      if (min !== '') updatedItem.type_options.min = parseFloat(min);
      if (max !== '') updatedItem.type_options.max = parseFloat(max);
      if (numType) updatedItem.type_options.num_type = numType;
    }
  }

  try {
    let endpoint, method;
    const isNew = !updatedItem.uid;

    switch(editingType) {
      case 'category':
        endpoint = isNew ? '/api/categories' : `/api/categories/${updatedItem.uid}`;
        method = isNew ? 'POST' : 'PUT';
        break;
      case 'spec-group':
        endpoint = isNew ? '/api/specification-groups' : `/api/specification-groups/${updatedItem.uid}`;
        method = isNew ? 'POST' : 'PUT';
        break;
      case 'specification':
        endpoint = isNew ? '/api/specifications' : `/api/specifications/${updatedItem.uid}`;
        method = isNew ? 'POST' : 'PUT';
        break;
      case 'enum-option':
        endpoint = isNew ? '/api/enum-options' : `/api/enum-options/${updatedItem.uid}`;
        method = isNew ? 'POST' : 'PUT';
        break;
    }

    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedItem)
    });

    if (!response.ok) throw new Error('Save failed');

    document.getElementById('modal').classList.remove('active');
    await loadData();
    renderTree();
  } catch (error) {
    console.error('Save failed:', error);
    alert('Failed to save item');
  }
}

// Start the app
init();
