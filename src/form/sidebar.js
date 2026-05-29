    
// ========== Create ACTIVITY BAR SWITCHING ==========

document.getElementById('activityBar').innerHTML = `        
        <!--div class="activity-icon active" data-panel="explorer" title="Explorer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
          </svg>
        </div-->

<div class="activity-icon active" data-panel="propertiesPanel" title="Variables">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M8 3H7a2 2 0 00-2 2v5a2 2 0 01-2 2 2 2 0 012 2v5a2 2 0 002 2h1"/>
    <path d="M16 3h1a2 2 0 012 2v5a2 2 0 002 2 2 2 0 00-2 2v5a2 2 0 01-2 2h-1"/>
  </svg>
</div>

        <div class="activity-icon" data-panel="libraryPanel" title="Library">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 8l10-6 10 6"/>
            <path d="M5 8v12"/>
            <path d="M12 8v12"/>
            <path d="M19 8v12"/>
            <path d="M2 20h20"/>
            <path d="M9 20V16a3 3 0 016 0v4"/>
          </svg>
        </div>

  <!--div class="activity-icon" data-panel="listElements" title="List Elements">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="3" y="4" width="18" height="4" rx="1"/>
    <rect x="3" y="10" width="18" height="4" rx="1"/>
    <rect x="3" y="16" width="18" height="4" rx="1"/>
  </svg>
</div>

     
        <div class="activity-icon" data-panel="library" title="Library">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2c-2 0-4 0-4 2v2h4v2H6c-2 0-2 2-2 4s0 4 2 4h2v-2c0-2 2-2 4-2h4c2 0 2-2 2-4V4c0-2-2-2-4-2z"/>
            <path d="M12 22c2 0 4 0 4-2v-2h-4v-2h6c2 0 2-2 2-4s0-4-2-4h-2v2c0 2-2 2-4 2H8c-2 0-2 2-2 4v4c0 2 2 2 4 2z"/>
          </svg>
        </div-->

        <div class="activity-bottom">
          <!--div class="activity-icon" id="themeToggle" title="Toggle Dark Mode">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" id="themeIcon">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </div>

          <div class="activity-icon" title="Settings">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
          </div>
        </div--> `;

// ==========  ACTIVITY BAR SWITCHING one strating ==========



// ========== Add Event Listeners for Activity Bar Switching ==========



document.querySelectorAll('.activity-icon').forEach(icon => {
  icon.addEventListener('click', () => {
    // Remove active class from all icons
    document.querySelectorAll('.activity-icon').forEach(i => i.classList.remove('active'));
    // Add active class to clicked icon
    icon.classList.add('active');
    // Get the panel to show from data attribute
    const panelToShow = icon.getAttribute('data-panel');
    // Hide all panels
    document.querySelectorAll('.panel').forEach(panel => panel.style.display='none');
    // Show the selected panel
    document.getElementById(panelToShow).style.display = 'block';
  });
});