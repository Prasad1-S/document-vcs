$(function () {
  'use strict';

  // ============================================================================
  // NAVIGATION HANDLERS
  // ============================================================================
  
  const navigation = {
    init() {
      $('.prof').on('click', () => location.href = '/profile');
      $('.newDoc').on('click', () => location.href = '/new');
      $('.home').on('click', () => location.href = '/home');
      $('.setti').on('click', () => location.href = '/settings');
      $('.log').on('click', () => location.href = '/logout');

      // Profile menu toggle
      $('.profile').on('click', (e) => {
        e.stopPropagation();
        $('.logout').toggle();
      });

      // Close menu on outside click
      $(document).on('click', () => $('.logout').hide());
      $('.logout').on('click', (e) => e.stopPropagation());
    }
  };

  // ============================================================================
  // VERSION PREVIEW SYSTEM
  // ============================================================================
  
  const versionPreview = {
    currentVersion: null,

    init() {
      this.bindEvents();
    },

    bindEvents() {
      // Click on card to select and preview
      $('.version-card').on('click', (e) => {
        // Don't trigger if clicking rollback button
        if ($(e.target).closest('.btn-rollback').length) {
          return;
        }
        const $card = $(e.currentTarget);
        this.selectVersion($card);
      });
    },

    selectVersion($card) {
      // Update UI
      $('.version-card').removeClass('selected');
      $card.addClass('selected');

      // Store current selection
      this.currentVersion = this.extractVersionData($card);

      // Update preview panel
      this.updatePreview(this.currentVersion);
    },

    extractVersionData($card) {
      return {
        docid: $card.data('docid'),
        version: $card.data('version'),
        title: $card.data('title'),
        content: $card.find('.version-content').html(),
        editor: $card.data('editor'),
        editorImg: $card.data('editor-img'),
        time: $card.data('time'),
        summary: $card.data('summary'),
        isCurrent: $card.hasClass('is-current')
      };
    },

    updatePreview(versionData) {
      $('#previewTitle').text(versionData.title);
      $('#previewContent').html(versionData.content);
    },


  };

  // ============================================================================
  // ROLLBACK SYSTEM
  // ============================================================================
  
  const rollbackSystem = {
    $modal: null,
    selectedVersion: null,

    init() {
      this.$modal = $('#rollbackModal');
      this.bindEvents();
    },

    bindEvents() {
      // Rollback button on version cards
      $('.btn-rollback').on('click', (e) => {
        e.stopPropagation();
        const $card = $(e.currentTarget).closest('.version-card');
        this.openModal($card);
      });

      // Modal actions
      $('#cancelRollback, #closeModal').on('click', () => this.closeModal());
      $('#confirmRollback').on('click', () => this.confirmRollback());

      // Close modal on overlay click
      this.$modal.on('click', (e) => {
        if ($(e.target).hasClass('modal-overlay')) {
          this.closeModal();
        }
      });

      // ESC key to close modal
      $(document).on('keydown', (e) => {
        if (e.key === 'Escape' && this.$modal.attr('aria-hidden') === 'false') {
          this.closeModal();
        }
      });
    },

    openModal($card) {
      this.selectedVersion = versionPreview.extractVersionData($card);
      this.populateModal(this.selectedVersion);
      this.showModal();
    },

    populateModal(versionData) {
      $('#modalVersion').text(`v${versionData.version}`);
      $('#modalSummary').text(versionData.summary || 'No summary available');
      $('#modalEditor').text(versionData.editor);
      $('#modalTime').text(versionData.time);
    },

    showModal() {
      this.$modal.attr('aria-hidden', 'false').fadeIn(200);
      $('body').css('overflow', 'hidden');
    },

    closeModal() {
      this.$modal.attr('aria-hidden', 'true').fadeOut(200);
      $('body').css('overflow', '');
    },

    confirmRollback() {
      if (!this.selectedVersion) {
        console.error('No version selected for rollback');
        return;
      }

      console.log('Rolling back to version:', this.selectedVersion);

      // Send rollback request
      $.ajax({
        url: `/document/rollback/${this.selectedVersion.docid}/${this.selectedVersion.version}`,
        method: 'POST',
        success: (response) => {
          console.log('Rollback successful:', response);
          // Redirect to document or refresh page
          window.location.href = `/document/view/${this.selectedVersion.docid}?notification=Successfully rolled back to version number ${this.selectedVersion.version}`;
        },
        error: (xhr, status, error) => {
          console.error('Rollback failed:', error);
          alert('Failed to rollback. Please try again.');
          this.closeModal();
        }
      });
    }
  };

  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  
  navigation.init();
  versionPreview.init();
  rollbackSystem.init();

  // Auto-select and preview the current version on load
  const $currentCard = $('.version-card.is-current');
  if ($currentCard.length) {
    versionPreview.selectVersion($currentCard);
  }

});
