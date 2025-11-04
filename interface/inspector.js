// Taxonomy Inspector
class TaxonomyInspector {
    constructor() {
        this.config = null;
        this.categories = [];
        this.specGroups = [];
        this.specifications = [];
        this.expandedNodes = new Set();
        this.collapsedNodes = new Set();
        this.init();
    }

    async init() {
        await this.loadConfig();
        await this.loadData();
        this.render();
        this.attachEventListeners();
    }

    async loadConfig() {
        try {
            const response = await fetch('inspector-config.json');
            this.config = await response.json();
        } catch (error) {
            console.error('Failed to load config:', error);
            this.config = {
                defaultStates: {
                    category: 'closed',
                    specGroup: 'closed',
                    specification: 'closed'
                }
            };
        }
    }

    async loadData() {
        try {
            const [categories, specGroups, specifications] = await Promise.all([
                fetch('/data/categories.json').then(r => {
                    if (!r.ok) throw new Error(`Failed to fetch categories: ${r.status}`);
                    return r.json();
                }),
                fetch('/data/specification-groups.json').then(r => {
                    if (!r.ok) throw new Error(`Failed to fetch spec groups: ${r.status}`);
                    return r.json();
                }),
                fetch('/data/specifications.json').then(r => {
                    if (!r.ok) throw new Error(`Failed to fetch specifications: ${r.status}`);
                    return r.json();
                })
            ]);

            this.categories = categories || [];
            this.specGroups = specGroups || [];
            this.specifications = specifications || [];

            console.log('Loaded data:', {
                categories: this.categories.length,
                specGroups: this.specGroups.length,
                specifications: this.specifications.length
            });
        } catch (error) {
            console.error('Failed to load taxonomy data:', error);
            this.showError(`Failed to load taxonomy data: ${error.message}<br>Check browser console for details.`);
        }
    }

    showError(message) {
        const container = document.getElementById('tree-container');
        container.innerHTML = `
            <div class="empty-state">
                <p style="color: #e74c3c; font-weight: bold;">Error</p>
                <p>${message}</p>
            </div>
        `;
    }

    render() {
        const container = document.getElementById('tree-container');

        if (this.categories.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No categories found</p>
                    <p>Add categories to ../app/data/categories.json</p>
                </div>
            `;
            return;
        }

        // Build category tree (parent-child relationships)
        const rootCategories = this.categories
            .filter(cat => !cat.parent_category_uid)
            .sort((a, b) => {
                const rankA = a.position_rank ?? 0;
                const rankB = b.position_rank ?? 0;
                return rankB - rankA; // Higher rank first
            });

        let html = '<div class="tree">';
        rootCategories.forEach(category => {
            html += this.renderCategory(category, 0);
        });
        html += '</div>';

        container.innerHTML = html;
    }

    renderCategory(category, depth, isAltPosition = false) {
        const nodeId = isAltPosition ? `category-alt-${category.uid}` : `category-${category.uid}`;
        const isExpanded = this.isNodeExpanded(nodeId);
        const hasChildren = this.hasChildren(category);

        // Get child categories (main parent relationship)
        const childCategories = this.categories
            .filter(cat => cat.parent_category_uid === category.uid)
            .sort((a, b) => {
                const rankA = a.position_rank ?? 0;
                const rankB = b.position_rank ?? 0;
                return rankB - rankA; // Higher rank first
            });

        // Get alternative child categories (alt parent relationship)
        const altChildCategories = this.categories
            .filter(cat => cat.alt_parent_category_uid === category.uid)
            .sort((a, b) => {
                // Use alt_position_rank if available, otherwise fall back to position_rank
                const rankA = a.alt_position_rank ?? a.position_rank ?? 0;
                const rankB = b.alt_position_rank ?? b.position_rank ?? 0;
                return rankB - rankA; // Higher rank first
            });

        const categorySpecGroups = this.specGroups
            .filter(sg => sg.category_uid === category.uid)
            .sort((a, b) => {
                const rankA = a.position_rank ?? 0;
                const rankB = b.position_rank ?? 0;
                return rankB - rankA; // Higher rank first
            });

        const totalChildren = childCategories.length + altChildCategories.length + categorySpecGroups.length;

        const isMetaCategory = category.isMetaCategory === true;

        let html = `
            <div class="tree-node ${isAltPosition ? 'alt-position' : ''} ${isMetaCategory ? 'meta-category' : ''}" data-node-id="${nodeId}" data-depth="${depth}">
                <div class="tree-item category ${isAltPosition ? 'alt-position' : ''} ${isMetaCategory ? 'meta-category' : ''}" data-node-id="${nodeId}">
                    ${totalChildren > 0 ?
                        `<span class="toggle-icon">${isExpanded ? '▼' : '▶'}</span>` :
                        `<span class="toggle-icon empty">•</span>`
                    }
                    <span class="node-icon">📁</span>
                    <span class="node-label">${this.getLabel(category.label)}</span>
                    <span class="node-meta ${isMetaCategory ? 'meta-name' : ''}">${isMetaCategory ? `[${category.name}]` : `(${category.name})`}</span>
                    ${isAltPosition && category.alt_position_rank !== undefined
                        ? `<span class="node-meta">alt-rank: ${category.alt_position_rank}</span>`
                        : category.position_rank !== undefined
                            ? `<span class="node-meta">rank: ${category.position_rank}</span>`
                            : ''}
                    ${isAltPosition ? '<span class="badge alt-position">Alt Position</span>' : ''}
                    ${isMetaCategory ? '<span class="badge meta-category">Meta</span>' : ''}
                    ${totalChildren > 0 ? `<span class="node-meta">${totalChildren} items</span>` : ''}
                </div>
                <div class="node-children ${isExpanded ? '' : 'collapsed'}">
        `;

        // Render main child categories first
        childCategories.forEach(childCat => {
            html += this.renderCategory(childCat, depth + 1, false);
        });

        // Render alternative child categories (highlighted)
        altChildCategories.forEach(altChildCat => {
            html += this.renderCategory(altChildCat, depth + 1, true);
        });

        // Then render spec groups
        categorySpecGroups.forEach(specGroup => {
            html += this.renderSpecGroup(specGroup, depth + 1);
        });

        html += `
                </div>
            </div>
        `;

        return html;
    }

    renderSpecGroup(specGroup, depth) {
        const nodeId = `specgroup-${specGroup.uid}`;
        const isExpanded = this.isNodeExpanded(nodeId);

        const groupSpecs = this.specifications
            .filter(spec => spec.specification_group_uid === specGroup.uid)
            .sort((a, b) => {
                const rankA = a.position_rank ?? 0;
                const rankB = b.position_rank ?? 0;
                return rankB - rankA; // Higher rank first
            });

        const totalSpecs = groupSpecs.length;

        let html = `
            <div class="tree-node" data-node-id="${nodeId}" data-depth="${depth}">
                <div class="tree-item spec-group" data-node-id="${nodeId}">
                    ${totalSpecs > 0 ?
                        `<span class="toggle-icon">${isExpanded ? '▼' : '▶'}</span>` :
                        `<span class="toggle-icon empty">•</span>`
                    }
                    <span class="node-icon">📋</span>
                    <span class="node-label">${this.getLabel(specGroup.label)}</span>
                    <span class="node-meta">(${specGroup.name})</span>
                    <span class="node-meta">${specGroup.type}</span>
                    ${specGroup.position_rank !== undefined ? `<span class="node-meta">rank: ${specGroup.position_rank}</span>` : ''}
                    ${totalSpecs > 0 ? `<span class="node-meta">${totalSpecs} specs</span>` : ''}
                </div>
                <div class="node-children ${isExpanded ? '' : 'collapsed'}">
        `;

        groupSpecs.forEach(spec => {
            html += this.renderSpecification(spec, depth + 1);
        });

        html += `
                </div>
            </div>
        `;

        return html;
    }

    renderSpecification(spec, depth) {
        const nodeId = `spec-${spec.uid}`;
        const isExpanded = this.isNodeExpanded(nodeId);

        let html = `
            <div class="tree-node" data-node-id="${nodeId}" data-depth="${depth}">
                <div class="tree-item specification" data-node-id="${nodeId}">
                    <span class="toggle-icon">${isExpanded ? '▼' : '▶'}</span>
                    <span class="node-icon">🔧</span>
                    <span class="node-label">${this.getLabel(spec.label)}</span>
                    <span class="node-meta">(${spec.name})</span>
                    <span class="node-meta">${spec.type}</span>
                    ${spec.position_rank !== undefined ? `<span class="node-meta">rank: ${spec.position_rank}</span>` : ''}
                    ${spec.required ? '<span class="badge required">Required</span>' : '<span class="badge optional">Optional</span>'}
                    ${spec.highlighted ? '<span class="badge highlighted">Highlighted</span>' : ''}
                </div>
                <div class="node-details ${isExpanded ? '' : 'collapsed'}">
                    ${this.renderSpecificationDetails(spec)}
                </div>
            </div>
        `;

        return html;
    }

    renderSpecificationDetails(spec) {
        let html = '';

        if (spec.internal_description) {
            html += `
                <div class="detail-row">
                    <span class="detail-label">Description:</span>
                    <span class="detail-value">${spec.internal_description}</span>
                </div>
            `;
        }

        html += `
            <div class="detail-row">
                <span class="detail-label">Type:</span>
                <span class="detail-value">${spec.type}</span>
            </div>
        `;

        if (spec.type_options && Object.keys(spec.type_options).length > 0) {
            html += `
                <div class="detail-row">
                    <span class="detail-label">Type Options:</span>
                    <span class="detail-value json">${JSON.stringify(spec.type_options, null, 2)}</span>
                </div>
            `;
        }

        html += `
            <div class="detail-row">
                <span class="detail-label">Required:</span>
                <span class="detail-value">${spec.required ? 'Yes' : 'No'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Highlighted:</span>
                <span class="detail-value">${spec.highlighted ? 'Yes' : 'No'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Position Rank:</span>
                <span class="detail-value">${spec.position_rank || 'N/A'}</span>
            </div>
        `;

        if (spec.regexp_pattern) {
            html += `
                <div class="detail-row">
                    <span class="detail-label">RegExp Pattern:</span>
                    <span class="detail-value json">${spec.regexp_pattern}</span>
                </div>
            `;
        }

        html += `
            <div class="detail-row">
                <span class="detail-label">UID:</span>
                <span class="detail-value json">${spec.uid}</span>
            </div>
        `;

        return html;
    }

    getLabel(labelObj) {
        if (!labelObj) return 'Untitled';
        return labelObj.en || labelObj.de || labelObj.es || Object.values(labelObj)[0] || 'Untitled';
    }

    hasChildren(category) {
        const hasChildCategories = this.categories.some(cat =>
            cat.parent_category_uid === category.uid
        );
        const hasSpecGroups = this.specGroups.some(sg =>
            sg.category_uid === category.uid
        );
        return hasChildCategories || hasSpecGroups;
    }

    isNodeExpanded(nodeId) {
        // Check if manually expanded
        if (this.expandedNodes.has(nodeId)) {
            return true;
        }

        // Check if manually collapsed
        if (this.collapsedNodes.has(nodeId)) {
            return false;
        }

        // Check default state from config
        if (nodeId.startsWith('category-')) {
            return this.config.defaultStates.category === 'open';
        } else if (nodeId.startsWith('specgroup-')) {
            return this.config.defaultStates.specGroup === 'open';
        } else if (nodeId.startsWith('spec-')) {
            return this.config.defaultStates.specification === 'open';
        }

        return false;
    }

    toggleNode(nodeId) {
        const isCurrentlyExpanded = this.isNodeExpanded(nodeId);

        // Remove from both sets first
        this.expandedNodes.delete(nodeId);
        this.collapsedNodes.delete(nodeId);

        // Add to the opposite set
        if (isCurrentlyExpanded) {
            this.collapsedNodes.add(nodeId);
        } else {
            this.expandedNodes.add(nodeId);
        }

        this.render();
    }

    expandAll() {
        // Clear collapsed set and add all nodes to expanded set
        this.collapsedNodes.clear();
        document.querySelectorAll('[data-node-id]').forEach(el => {
            const nodeId = el.getAttribute('data-node-id');
            if (nodeId) {
                this.expandedNodes.add(nodeId);
            }
        });
        this.render();
    }

    collapseAll() {
        this.expandedNodes.clear();
        this.collapsedNodes.clear();
        // Add all nodes to collapsed set
        document.querySelectorAll('[data-node-id]').forEach(el => {
            const nodeId = el.getAttribute('data-node-id');
            if (nodeId) {
                this.collapsedNodes.add(nodeId);
            }
        });
        this.render();
    }

    expandToDepth(maxDepth) {
        this.expandedNodes.clear();
        this.collapsedNodes.clear();

        // Recursively expand categories up to maxDepth
        const processCategory = (category, currentDepth) => {
            const nodeId = `category-${category.uid}`;

            if (currentDepth < maxDepth) {
                this.expandedNodes.add(nodeId);

                // Process child categories
                const childCategories = this.categories.filter(cat =>
                    cat.parent_category_uid === category.uid
                );
                childCategories.forEach(childCat => {
                    processCategory(childCat, currentDepth + 1);
                });
            } else {
                this.collapsedNodes.add(nodeId);
            }
        };

        // Start with root categories at depth 0
        const rootCategories = this.categories.filter(cat => !cat.parent_category_uid);
        rootCategories.forEach(category => {
            processCategory(category, 0);
        });

        this.render();
    }

    attachEventListeners() {
        // Toggle nodes
        document.getElementById('tree-container').addEventListener('click', (e) => {
            const treeItem = e.target.closest('.tree-item');
            if (treeItem) {
                const nodeId = treeItem.getAttribute('data-node-id');
                if (nodeId) {
                    this.toggleNode(nodeId);
                }
            }
        });

        // Control buttons
        document.getElementById('expandAll').addEventListener('click', () => {
            this.expandAll();
        });

        document.getElementById('collapseAll').addEventListener('click', () => {
            this.collapseAll();
        });

        document.getElementById('reload').addEventListener('click', async () => {
            document.getElementById('tree-container').innerHTML = '<div id="loading">Reloading taxonomy data...</div>';
            await this.loadData();
            this.render();
        });

        document.getElementById('applyDepth').addEventListener('click', () => {
            const depth = parseInt(document.getElementById('depthSelector').value);
            if (depth === 999) {
                this.expandAll();
            } else if (depth === 0) {
                this.collapseAll();
            } else {
                this.expandToDepth(depth);
            }
        });
    }
}

// Initialize the inspector when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TaxonomyInspector();
});
