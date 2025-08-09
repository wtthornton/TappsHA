/**
 * Data Table Component for Agent-OS Dashboard
 * Provides sorting, filtering, pagination, and interactive features
 */

class AgentOSDataTable {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.getElementById(container) : container;
    this.options = {
      columns: [],
      data: [],
      pageSize: 10,
      sortable: true,
      filterable: true,
      selectable: false,
      searchable: true,
      pagination: true,
      responsive: true,
      loading: false,
      emptyMessage: 'No data available',
      ...options
    };
    
    this.currentPage = 1;
    this.sortColumn = null;
    this.sortDirection = 'asc';
    this.filters = {};
    this.searchTerm = '';
    this.selectedRows = new Set();
    this.filteredData = [];
    this.sortedData = [];
    
    this.init();
  }

  /**
   * Initialize the data table
   */
  init() {
    if (!this.container) {
      console.error('Container element not found');
      return;
    }

    this.setupStyles();
    this.render();
    this.setupEventListeners();
    console.log('✅ Agent-OS Data Table initialized');
  }

  /**
   * Setup table styles
   */
  setupStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .agent-os-table-container {
        background: var(--color-surface-elevated);
        border-radius: 8px;
        border: 1px solid var(--color-border-medium);
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .agent-os-table-header {
        padding: 16px 20px;
        border-bottom: 1px solid var(--color-border-light);
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
      }

      .agent-os-table-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--color-text-primary);
        margin: 0;
      }

      .agent-os-table-controls {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }

      .agent-os-table-search {
        position: relative;
        min-width: 200px;
      }

      .agent-os-table-search input {
        width: 100%;
        padding: 8px 12px 8px 36px;
        border: 1px solid var(--color-border-medium);
        border-radius: 6px;
        font-size: 14px;
        background: var(--color-surface);
        color: var(--color-text-primary);
        transition: border-color 0.2s ease;
      }

      .agent-os-table-search input:focus {
        outline: none;
        border-color: var(--color-primary-500);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      .agent-os-table-search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--color-text-tertiary);
        font-size: 14px;
      }

      .agent-os-table-filters {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .agent-os-table-filter {
        padding: 6px 12px;
        border: 1px solid var(--color-border-medium);
        border-radius: 6px;
        font-size: 12px;
        background: var(--color-surface);
        color: var(--color-text-secondary);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .agent-os-table-filter:hover {
        background: var(--color-surface-hover);
        color: var(--color-text-primary);
      }

      .agent-os-table-filter.active {
        background: var(--color-primary-500);
        color: white;
        border-color: var(--color-primary-500);
      }

      .agent-os-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
      }

      .agent-os-table th {
        background: var(--color-surface);
        padding: 12px 16px;
        text-align: left;
        font-weight: 600;
        color: var(--color-text-primary);
        border-bottom: 2px solid var(--color-border-light);
        cursor: pointer;
        transition: background-color 0.2s ease;
        user-select: none;
      }

      .agent-os-table th:hover {
        background: var(--color-surface-hover);
      }

      .agent-os-table th.sortable {
        position: relative;
        padding-right: 24px;
      }

      .agent-os-table th.sortable::after {
        content: '↕';
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--color-text-tertiary);
        font-size: 12px;
      }

      .agent-os-table th.sort-asc::after {
        content: '↑';
        color: var(--color-primary-500);
      }

      .agent-os-table th.sort-desc::after {
        content: '↓';
        color: var(--color-primary-500);
      }

      .agent-os-table td {
        padding: 12px 16px;
        border-bottom: 1px solid var(--color-border-light);
        color: var(--color-text-secondary);
        transition: background-color 0.2s ease;
      }

      .agent-os-table tbody tr {
        transition: background-color 0.2s ease;
      }

      .agent-os-table tbody tr:hover {
        background: var(--color-surface-hover);
      }

      .agent-os-table tbody tr.selected {
        background: var(--color-primary-50);
      }

      .agent-os-table tbody tr.selected:hover {
        background: var(--color-primary-100);
      }

      .agent-os-table-checkbox {
        width: 16px;
        height: 16px;
        cursor: pointer;
      }

      .agent-os-table-empty {
        padding: 40px 20px;
        text-align: center;
        color: var(--color-text-tertiary);
        font-style: italic;
      }

      .agent-os-table-loading {
        padding: 40px 20px;
        text-align: center;
        color: var(--color-text-tertiary);
      }

      .agent-os-table-loading-spinner {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 2px solid var(--color-border-light);
        border-top: 2px solid var(--color-primary-500);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-right: 8px;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .agent-os-table-footer {
        padding: 16px 20px;
        border-top: 1px solid var(--color-border-light);
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
      }

      .agent-os-table-info {
        color: var(--color-text-tertiary);
        font-size: 14px;
      }

      .agent-os-table-pagination {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .agent-os-table-pagination button {
        padding: 6px 12px;
        border: 1px solid var(--color-border-medium);
        border-radius: 4px;
        background: var(--color-surface);
        color: var(--color-text-secondary);
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s ease;
      }

      .agent-os-table-pagination button:hover:not(:disabled) {
        background: var(--color-surface-hover);
        color: var(--color-text-primary);
      }

      .agent-os-table-pagination button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .agent-os-table-pagination button.active {
        background: var(--color-primary-500);
        color: white;
        border-color: var(--color-primary-500);
      }

      .agent-os-table-pagination select {
        padding: 4px 8px;
        border: 1px solid var(--color-border-medium);
        border-radius: 4px;
        background: var(--color-surface);
        color: var(--color-text-primary);
        font-size: 12px;
      }

      @media (max-width: 768px) {
        .agent-os-table-header {
          flex-direction: column;
          align-items: stretch;
        }

        .agent-os-table-controls {
          justify-content: space-between;
        }

        .agent-os-table-search {
          min-width: auto;
          flex: 1;
        }

        .agent-os-table {
          font-size: 12px;
        }

        .agent-os-table th,
        .agent-os-table td {
          padding: 8px 12px;
        }

        .agent-os-table-footer {
          flex-direction: column;
          align-items: stretch;
        }

        .agent-os-table-pagination {
          justify-content: center;
        }
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Render the data table
   */
  render() {
    this.container.innerHTML = '';
    this.container.className = 'agent-os-table-container';

    // Header
    const header = this.createHeader();
    this.container.appendChild(header);

    // Table
    const table = this.createTable();
    this.container.appendChild(table);

    // Footer
    if (this.options.pagination) {
      const footer = this.createFooter();
      this.container.appendChild(footer);
    }

    this.updateData();
  }

  /**
   * Create table header
   */
  createHeader() {
    const header = document.createElement('div');
    header.className = 'agent-os-table-header';

    const title = document.createElement('h3');
    title.className = 'agent-os-table-title';
    title.textContent = this.options.title || 'Data Table';

    const controls = document.createElement('div');
    controls.className = 'agent-os-table-controls';

    // Search
    if (this.options.searchable) {
      const search = document.createElement('div');
      search.className = 'agent-os-table-search';
      
      const searchIcon = document.createElement('span');
      searchIcon.className = 'agent-os-table-search-icon';
      searchIcon.textContent = '🔍';
      
      const searchInput = document.createElement('input');
      searchInput.type = 'text';
      searchInput.placeholder = 'Search...';
      searchInput.value = this.searchTerm;
      searchInput.addEventListener('input', (e) => {
        this.searchTerm = e.target.value;
        this.currentPage = 1;
        this.updateData();
      });
      
      search.appendChild(searchIcon);
      search.appendChild(searchInput);
      controls.appendChild(search);
    }

    // Filters
    if (this.options.filterable && this.options.columns.length > 0) {
      const filters = document.createElement('div');
      filters.className = 'agent-os-table-filters';
      
      this.options.columns.forEach(column => {
        if (column.filterable !== false) {
          const filter = document.createElement('button');
          filter.className = 'agent-os-table-filter';
          filter.textContent = column.title;
          filter.dataset.column = column.key;
          filter.addEventListener('click', () => {
            this.toggleFilter(column.key);
          });
          filters.appendChild(filter);
        }
      });
      
      controls.appendChild(filters);
    }

    header.appendChild(title);
    header.appendChild(controls);
    return header;
  }

  /**
   * Create table element
   */
  createTable() {
    const table = document.createElement('table');
    table.className = 'agent-os-table';

    // Table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    // Checkbox column for selection
    if (this.options.selectable) {
      const checkboxHeader = document.createElement('th');
      checkboxHeader.style.width = '40px';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'agent-os-table-checkbox';
      checkbox.addEventListener('change', (e) => {
        this.toggleSelectAll(e.target.checked);
      });
      
      checkboxHeader.appendChild(checkbox);
      headerRow.appendChild(checkboxHeader);
    }

    // Column headers
    this.options.columns.forEach(column => {
      const th = document.createElement('th');
      th.textContent = column.title;
      
      if (this.options.sortable && column.sortable !== false) {
        th.className = 'sortable';
        th.addEventListener('click', () => {
          this.sort(column.key);
        });
      }
      
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Table body
    const tbody = document.createElement('tbody');
    tbody.id = 'agent-os-table-body';
    table.appendChild(tbody);

    return table;
  }

  /**
   * Create table footer
   */
  createFooter() {
    const footer = document.createElement('div');
    footer.className = 'agent-os-table-footer';

    const info = document.createElement('div');
    info.className = 'agent-os-table-info';
    info.id = 'agent-os-table-info';

    const pagination = document.createElement('div');
    pagination.className = 'agent-os-table-pagination';
    pagination.id = 'agent-os-table-pagination';

    footer.appendChild(info);
    footer.appendChild(pagination);
    return footer;
  }

  /**
   * Update table data
   */
  updateData() {
    const tbody = document.getElementById('agent-os-table-body');
    if (!tbody) return;

    if (this.options.loading) {
      tbody.innerHTML = `
        <tr>
          <td colspan="${this.options.columns.length + (this.options.selectable ? 1 : 0)}" class="agent-os-table-loading">
            <div class="agent-os-table-loading-spinner"></div>
            Loading...
          </td>
        </tr>
      `;
      return;
    }

    // Apply filters and search
    this.filteredData = this.filterData();
    
    // Apply sorting
    this.sortedData = this.sortData();
    
    // Apply pagination
    const paginatedData = this.paginateData();

    if (paginatedData.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="${this.options.columns.length + (this.options.selectable ? 1 : 0)}" class="agent-os-table-empty">
            ${this.options.emptyMessage}
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML = '';
      paginatedData.forEach((row, index) => {
        const tr = this.createTableRow(row, index);
        tbody.appendChild(tr);
      });
    }

    this.updateInfo();
    this.updatePagination();
  }

  /**
   * Create table row
   */
  createTableRow(row, index) {
    const tr = document.createElement('tr');
    tr.dataset.index = index;
    
    if (this.selectedRows.has(index)) {
      tr.classList.add('selected');
    }

    // Checkbox for selection
    if (this.options.selectable) {
      const td = document.createElement('td');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'agent-os-table-checkbox';
      checkbox.checked = this.selectedRows.has(index);
      checkbox.addEventListener('change', (e) => {
        this.toggleRowSelection(index, e.target.checked);
      });
      td.appendChild(checkbox);
      tr.appendChild(td);
    }

    // Data cells
    this.options.columns.forEach(column => {
      const td = document.createElement('td');
      const value = row[column.key];
      
      if (column.render) {
        td.innerHTML = column.render(value, row, index);
      } else {
        td.textContent = value || '';
      }
      
      tr.appendChild(td);
    });

    return tr;
  }

  /**
   * Filter data based on search term and filters
   */
  filterData() {
    let filtered = [...this.options.data];

    // Apply search
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(row => {
        return this.options.columns.some(column => {
          const value = row[column.key];
          return value && value.toString().toLowerCase().includes(searchLower);
        });
      });
    }

    // Apply filters
    Object.keys(this.filters).forEach(columnKey => {
      const filterValue = this.filters[columnKey];
      if (filterValue) {
        filtered = filtered.filter(row => {
          const value = row[columnKey];
          return value && value.toString().toLowerCase().includes(filterValue.toLowerCase());
        });
      }
    });

    return filtered;
  }

  /**
   * Sort data
   */
  sortData() {
    if (!this.sortColumn) {
      return [...this.filteredData];
    }

    const column = this.options.columns.find(col => col.key === this.sortColumn);
    if (!column) return [...this.filteredData];

    return [...this.filteredData].sort((a, b) => {
      let aVal = a[this.sortColumn];
      let bVal = b[this.sortColumn];

      // Handle null/undefined values
      if (aVal == null) aVal = '';
      if (bVal == null) bVal = '';

      // Convert to strings for comparison
      aVal = aVal.toString().toLowerCase();
      bVal = bVal.toString().toLowerCase();

      let result = 0;
      if (aVal < bVal) result = -1;
      if (aVal > bVal) result = 1;

      return this.sortDirection === 'desc' ? -result : result;
    });
  }

  /**
   * Paginate data
   */
  paginateData() {
    if (!this.options.pagination) {
      return this.sortedData;
    }

    const start = (this.currentPage - 1) * this.options.pageSize;
    const end = start + this.options.pageSize;
    return this.sortedData.slice(start, end);
  }

  /**
   * Update table info
   */
  updateInfo() {
    const info = document.getElementById('agent-os-table-info');
    if (!info) return;

    const total = this.filteredData.length;
    const start = (this.currentPage - 1) * this.options.pageSize + 1;
    const end = Math.min(this.currentPage * this.options.pageSize, total);

    info.textContent = `Showing ${start}-${end} of ${total} entries`;
  }

  /**
   * Update pagination controls
   */
  updatePagination() {
    const pagination = document.getElementById('agent-os-table-pagination');
    if (!pagination) return;

    const totalPages = Math.ceil(this.filteredData.length / this.options.pageSize);
    
    pagination.innerHTML = '';

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Previous';
    prevBtn.disabled = this.currentPage === 1;
    prevBtn.addEventListener('click', () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.updateData();
      }
    });
    pagination.appendChild(prevBtn);

    // Page numbers
    const maxVisiblePages = 5;
    const startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = document.createElement('button');
      pageBtn.textContent = i;
      pageBtn.classList.toggle('active', i === this.currentPage);
      pageBtn.addEventListener('click', () => {
        this.currentPage = i;
        this.updateData();
      });
      pagination.appendChild(pageBtn);
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next';
    nextBtn.disabled = this.currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
      if (this.currentPage < totalPages) {
        this.currentPage++;
        this.updateData();
      }
    });
    pagination.appendChild(nextBtn);

    // Page size selector
    const pageSizeSelect = document.createElement('select');
    pageSizeSelect.value = this.options.pageSize;
    pageSizeSelect.addEventListener('change', (e) => {
      this.options.pageSize = parseInt(e.target.value);
      this.currentPage = 1;
      this.updateData();
    });

    [10, 25, 50, 100].forEach(size => {
      const option = document.createElement('option');
      option.value = size;
      option.textContent = `${size} per page`;
      pageSizeSelect.appendChild(option);
    });

    pagination.appendChild(pageSizeSelect);
  }

  /**
   * Sort table by column
   */
  sort(columnKey) {
    if (this.sortColumn === columnKey) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = columnKey;
      this.sortDirection = 'asc';
    }

    // Update sort indicators
    const headers = this.container.querySelectorAll('th.sortable');
    headers.forEach(header => {
      header.classList.remove('sort-asc', 'sort-desc');
      if (header.textContent === this.options.columns.find(col => col.key === columnKey)?.title) {
        header.classList.add(`sort-${this.sortDirection}`);
      }
    });

    this.updateData();
  }

  /**
   * Toggle filter
   */
  toggleFilter(columnKey) {
    const filter = this.container.querySelector(`[data-column="${columnKey}"]`);
    if (!filter) return;

    if (this.filters[columnKey]) {
      delete this.filters[columnKey];
      filter.classList.remove('active');
    } else {
      this.filters[columnKey] = true;
      filter.classList.add('active');
    }

    this.currentPage = 1;
    this.updateData();
  }

  /**
   * Toggle row selection
   */
  toggleRowSelection(index, selected) {
    if (selected) {
      this.selectedRows.add(index);
    } else {
      this.selectedRows.delete(index);
    }

    const row = this.container.querySelector(`tr[data-index="${index}"]`);
    if (row) {
      row.classList.toggle('selected', selected);
    }

    this.updateSelectAllCheckbox();
  }

  /**
   * Toggle select all
   */
  toggleSelectAll(selected) {
    const checkboxes = this.container.querySelectorAll('tbody .agent-os-table-checkbox');
    checkboxes.forEach((checkbox, index) => {
      checkbox.checked = selected;
      this.toggleRowSelection(index, selected);
    });
  }

  /**
   * Update select all checkbox
   */
  updateSelectAllCheckbox() {
    const selectAllCheckbox = this.container.querySelector('thead .agent-os-table-checkbox');
    if (!selectAllCheckbox) return;

    const checkboxes = this.container.querySelectorAll('tbody .agent-os-table-checkbox');
    const checkedCount = this.container.querySelectorAll('tbody .agent-os-table-checkbox:checked').length;
    
    selectAllCheckbox.checked = checkedCount === checkboxes.length;
    selectAllCheckbox.indeterminate = checkedCount > 0 && checkedCount < checkboxes.length;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Handle window resize for responsive behavior
    if (this.options.responsive) {
      window.addEventListener('resize', () => {
        this.updateData();
      });
    }
  }

  /**
   * Set data
   */
  setData(data) {
    this.options.data = data;
    this.currentPage = 1;
    this.selectedRows.clear();
    this.updateData();
  }

  /**
   * Set loading state
   */
  setLoading(loading) {
    this.options.loading = loading;
    this.updateData();
  }

  /**
   * Get selected rows
   */
  getSelectedRows() {
    return Array.from(this.selectedRows).map(index => this.sortedData[index]);
  }

  /**
   * Clear selection
   */
  clearSelection() {
    this.selectedRows.clear();
    this.updateData();
  }

  /**
   * Destroy the table
   */
  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AgentOSDataTable;
} else {
  window.AgentOSDataTable = AgentOSDataTable;
}
