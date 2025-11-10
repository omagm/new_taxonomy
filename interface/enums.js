// Enum Options Inspector
class EnumInspector {
    constructor() {
        this.enumOptions = [];
        this.specifications = [];
        this.expandedNodes = new Set();
        this.collapsedNodes = new Set();
        this.init();
    }

    async init() {
        await this.loadData();
        this.render();
        this.attachEventListeners();
    }

    async loadData() {
        try {
            const [enumOptions, specifications] = await Promise.all([
                fetch('/data/enum-options.json').then(r => {
                    if (!r.ok) throw new Error(`Failed to fetch enum options: ${r.status}`);
                    return r.json();
                }),
                fetch('/data/specifications.json').then(r => {
                    if (!r.ok) throw new Error(`Failed to fetch specifications: ${r.status}`);
                    return r.json();
                })
            ]);

            this.enumOptions = enumOptions || [];
            this.specifications = specifications || [];

            console.log('Loaded data:', {
                enumOptions: this.enumOptions.length,
                specifications: this.specifications.length
            });
        } catch (error) {
            console.error('Failed to load enum options data:', error);
            this.showError(`Failed to load enum options data: ${error.message}<br>Check browser console for details.`);
        }
    }

    showError(message) {
        const container = document.getElementById('enum-container');
        container.innerHTML = `
            <div class="empty-state">
                <p style="color: #e74c3c; font-weight: bold;">Error</p>
                <p>${message}</p>
            </div>
        `;
    }

    render() {
        const container = document.getElementById('enum-container');

        if (this.enumOptions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No enum options found</p>
                    <p>Add enum options to ../data/enum-options.json</p>
                </div>
            `;
            return;
        }

        // Group enum options by specification_uid
        const groupedBySpec = this.enumOptions.reduce((acc, enumOption) => {
            const specUid = enumOption.specification_uid;
            if (!acc[specUid]) {
                acc[specUid] = [];
            }
            acc[specUid].push(enumOption);
            return acc;
        }, {});

        let html = '<div class="tree">';
        html += `<div class="summary">Total: ${this.enumOptions.length} enum options across ${Object.keys(groupedBySpec).length} specifications</div>`;

        // Render each specification group
        Object.entries(groupedBySpec).forEach(([specUid, enums]) => {
            html += this.renderSpecificationGroup(specUid, enums);
        });

        html += '</div>';
        container.innerHTML = html;
    }

    renderSpecificationGroup(specUid, enums) {
        const nodeId = `spec-${specUid}`;
        const isExpanded = this.isNodeExpanded(nodeId);

        // Find the specification details
        const spec = this.specifications.find(s => s.uid === specUid);
        const specName = spec ? this.getLabel(spec.label) : 'Unknown Specification';
        const specInternalName = spec ? spec.name : specUid;

        const enumCount = enums.length;

        let html = `
            <div class="tree-node" data-node-id="${nodeId}">
                <div class="tree-item spec-group" data-node-id="${nodeId}">
                    <span class="toggle-icon">${isExpanded ? '▼' : '▶'}</span>
                    <span class="node-icon">📋</span>
                    <span class="node-label">${specName}</span>
                    <span class="node-meta">(${specInternalName})</span>
                    <span class="node-meta">${enumCount} options</span>
                </div>
                <div class="node-children ${isExpanded ? '' : 'collapsed'}">
        `;

        // Render each enum option
        enums.forEach(enumOption => {
            html += this.renderEnumOption(enumOption);
        });

        html += `
                </div>
            </div>
        `;

        return html;
    }

    renderEnumOption(enumOption) {
        const nodeId = `enum-${enumOption.uid}`;
        const isExpanded = this.isNodeExpanded(nodeId);

        let html = `
            <div class="tree-node" data-node-id="${nodeId}">
                <div class="tree-item specification" data-node-id="${nodeId}">
                    <span class="toggle-icon">${isExpanded ? '▼' : '▶'}</span>
                    <span class="node-icon">🏷️</span>
                    <span class="node-label">${this.getLabel(enumOption.label)}</span>
                    <span class="node-meta">(${enumOption.name})</span>
                    ${enumOption.highlighted ? '<span class="badge highlighted">Highlighted</span>' : ''}
                    ${enumOption.manufacturers_using && enumOption.manufacturers_using.length > 0
                        ? `<span class="badge">${enumOption.manufacturers_using.length} manufacturers</span>`
                        : ''}
                </div>
                <div class="node-details ${isExpanded ? '' : 'collapsed'}">
                    ${this.renderEnumDetails(enumOption)}
                </div>
            </div>
        `;

        return html;
    }

    renderEnumDetails(enumOption) {
        let html = `
            <div class="detail-row">
                <span class="detail-label">UID:</span>
                <span class="detail-value json">${enumOption.uid}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Name:</span>
                <span class="detail-value">${enumOption.name}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Label:</span>
                <span class="detail-value json">${JSON.stringify(enumOption.label, null, 2)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Specification UID:</span>
                <span class="detail-value json">${enumOption.specification_uid}</span>
            </div>
        `;

        html += `
            <div class="detail-row">
                <span class="detail-label">Highlighted:</span>
                <span class="detail-value">${enumOption.highlighted ? 'Yes' : 'No'}</span>
            </div>
        `;

        if (enumOption.manufacturers_using && enumOption.manufacturers_using.length > 0) {
            html += `
                <div class="detail-row">
                    <span class="detail-label">Manufacturers Using:</span>
                    <span class="detail-value json">${JSON.stringify(enumOption.manufacturers_using, null, 2)}</span>
                </div>
            `;
        }

        html += `
            <div class="detail-row">
                <span class="detail-label">Created At:</span>
                <span class="detail-value">${new Date(enumOption.created_at).toLocaleString()}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Updated At:</span>
                <span class="detail-value">${new Date(enumOption.updated_at).toLocaleString()}</span>
            </div>
        `;

        return html;
    }

    getLabel(labelObj) {
        if (!labelObj) return 'Untitled';
        if (typeof labelObj === 'string') return labelObj;
        return labelObj.en || labelObj.de || labelObj.es || Object.values(labelObj)[0] || 'Untitled';
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

        // Default: specification groups open, enum options closed
        if (nodeId.startsWith('spec-')) {
            return true;
        } else if (nodeId.startsWith('enum-')) {
            return false;
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

    attachEventListeners() {
        // Toggle nodes
        document.getElementById('enum-container').addEventListener('click', (e) => {
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
            document.getElementById('enum-container').innerHTML = '<div id="loading">Reloading enum options data...</div>';
            await this.loadData();
            this.render();
        });
    }
}

// Initialize the inspector when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new EnumInspector();
});
