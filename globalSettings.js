// This is the content for your ../globalSettings.js file
(function() {
    'use strict';
    const defaultSettings = {
      theme: 'dark', // Assuming this default exists
      enableAnimations: 'on', // Assuming this default exists
      showParticles: 'on', // Assuming this default exists
      showParticlesLines: 'on', // Assuming this default exists
      showMovingPhrases: 'on', // Assuming this default exists
      performanceCursorOn: 'on', // Assuming this default exists
      overlayColor: 'rgba(0, 0, 0, 0.95)', // Default dark overlay color with transparency
      cursorColor: 'rgba(255, 255, 255, 0.5)', // Default cursor border color
      cursorHoverColor: '#007bff', // Default cursor hover color
      sneakModeApp: 'off', // Default to 'off' - **Keep this default**
      openInBlank: 'off', // Assuming this default exists
      enableCustomCursor: 'on', // Assuming this default exists
      // ... other default settings you might have ...
    };

    let currentSettings = {}; // Store the currently applied settings

    // Mapping of sneakModeApp values to image paths (Adjust paths as needed)
    // These paths are relative to the *root* directory, as globalSettings.js is there.
    const sneakModeImageMap = {
         'GoogleSearch': 'Imgs/Google.png',
         'GoogleDocs': 'Imgs/Google Docs.png',
         'GoogleClassroom': 'Imgs/Google Classroom.png',
         // Add more mappings here if you add more images to Imgs/ in the root
         // Example: 'BlankWhite': 'Imgs/blank.png'
         // Example: 'BlankBlack': 'Imgs/black.png'
    };

    // References to sneak mode listeners so they can be removed (Keep these declarations)
    let mouseEnterListener = null; // for document.documentElement
    let mouseLeaveListener = null; // for document.documentElement
    let windowBlurListener = null; // for window
    let windowFocusListener = null; // for window

     // Get references to elements needed by sneak mode handlers
     // Querying them when the handler runs makes them more robust
     let unfocusedOverlay = null;
     // Use a variable to hold all elements that should be hidden when unfocused.
     // This includes sections on index.html, and specific elements on Games/Apps pages.
     let elementsToHideOnUnfocus = null; // **Corrected variable name and usage below**


    function loadSettings() {
      // Your existing loadSettings function
      let savedSettings = {};
      try {
        const savedString = localStorage.getItem('userSettings');
        if (savedString) {
          savedSettings = JSON.parse(savedString);
          console.log("globalSettings.js: Loaded settings from localStorage", savedSettings); // Debug load
        }
      } catch (e) {
        console.error("globalSettings.js: Error loading settings:", e);
      }
      currentSettings = {
         ...defaultSettings,
         ...savedSettings,
         overlayColor: savedSettings.hasOwnProperty('overlayColor') ? savedSettings.overlayColor : defaultSettings.overlayColor,
         cursorColor: savedSettings.hasOwnProperty('cursorColor') ? savedSettings.cursorColor : defaultSettings.cursorColor, // Ensure these are included
         cursorHoverColor: savedSettings.hasOwnProperty('cursorHoverColor') ? savedSettings.cursorHoverColor : defaultSettings.cursorHoverColor, // Ensure these are included
         enableAnimations: savedSettings.hasOwnProperty('enableAnimations') ? savedSettings.enableAnimations : defaultSettings.enableAnimations,
         showParticles: savedSettings.hasOwnProperty('showParticles') ? savedSettings.showParticles : defaultSettings.showParticles,
         showParticlesLines: savedSettings.hasOwnProperty('showParticlesLines') ? savedSettings.showParticlesLines : defaultSettings.showParticlesLines,
         showMovingPhrases: savedSettings.hasOwnProperty('showMovingPhrases') ? savedSettings.showMovingPhrases : defaultSettings.showMovingPhrases,
         performanceCursorOn: savedSettings.hasOwnProperty('performanceCursorOn') ? savedSettings.performanceCursorOn : defaultSettings.performanceCursorOn,
         openInBlank: savedSettings.hasOwnProperty('openInBlank') ? savedSettings.openInBlank : defaultSettings.openInBlank,
         enableCustomCursor: savedSettings.hasOwnProperty('enableCustomCursor') ? savedSettings.enableCustomCursor : defaultSettings.enableCustomCursor,
          // Ensure sneakModeApp is validated against the map or defaults
          sneakModeApp: savedSettings.hasOwnProperty('sneakModeApp') && savedSettings.sneakModeApp !== undefined && (savedSettings.sneakModeApp === 'off' || sneakModeImageMap[savedSettings.sneakModeApp])
                         ? savedSettings.sneakModeApp
                         : defaultSettings.sneakModeApp
      };
      console.log("globalSettings.js: Merged and set currentSettings:", currentSettings); // Debug merged settings
      return { ...currentSettings }; // Return a copy
    }

    function applySettings(settings) {
      currentSettings = { ...settings };
      const root = document.documentElement;
      const body = document.body;

      // Ensure element references are fresh (they might be added/removed by page logic)
      unfocusedOverlay = document.getElementById('unfocused-overlay');
      // Select ALL main content areas that should be hidden when unfocused.
      // This should cover sections on index.html and the main.hub-container + game page specific elements.
      // Use a selector that covers elements present on different pages.
      // Adjust this selector if your Games/Apps page uses different wrapping elements!
      elementsToHideOnUnfocus = document.querySelectorAll('section.content-section:not(#settings), main.hub-container, #backBtn, #nameContainer, .game-frame-wrapper, #buttonContainer');


      // Apply CSS Variables
      root.style.setProperty('--overlay-background', currentSettings.overlayColor);
      root.style.setProperty('--cursor-border-color', currentSettings.cursorColor);
      root.style.setProperty('--cursor-hover-border-color', currentSettings.cursorHoverColor);

      // Apply Body Classes for animations, cursor
      if (currentSettings.enableAnimations === 'off') {
        body.classList.add('no-animations');
      } else {
        body.classList.remove('no-animations');
      }

      // Custom cursor class (controls CSS :hover, etc.)
      if (currentSettings.enableCustomCursor === 'on') {
         body.classList.add('custom-cursor-enabled');
      } else {
         body.classList.remove('custom-cursor-enabled');
      }

      // Performance cursor class (still relevant even if custom cursor is off)
      if (currentSettings.performanceCursorOn === 'on') {
        body.classList.add('performance-cursor-on');
      } else {
        body.classList.remove('performance-cursor-on');
      }


      // --- Handle Sneak Mode Setting ---
      const sneakMode = currentSettings.sneakModeApp;
      if (unfocusedOverlay) {
           if (sneakMode !== 'off' && sneakModeImageMap[sneakMode]) {
               // Enable sneak mode listeners and set background image
               enableSneakMode();
               unfocusedOverlay.style.backgroundImage = `url('${sneakModeImageMap[sneakMode]}')`;
               console.log(`globalSettings.js: Sneak Mode ON. Image: ${sneakModeImageMap[sneakMode]}`);
                // Ensure overlay starts hidden if window is focused on load
                 if (document.hasFocus()) {
                    unfocusedOverlay.style.display = 'none';
                    body.classList.remove('unfocused');
                     // Also ensure content is visible
                     if (elementsToHideOnUnfocus) {
                         elementsToHideOnUnfocus.forEach(el => {
                             el.style.display = el._originalDisplay !== undefined ? el._originalDisplay : ''; // Restore original or revert to CSS default
                             delete el._originalDisplay;
                         });
                     }
                 } else {
                     // If window is not focused on load, apply the blur state immediately
                      handleWindowBlur(); // This will show overlay and hide content
                 }

           } else {
               // Disable sneak mode listeners and clear background image
               disableSneakMode();
               unfocusedOverlay.style.backgroundImage = ''; // Clear the image
               console.log("globalSettings.js: Sneak Mode OFF.");
                // Ensure content is visible and overlay hidden when turning OFF
                unfocusedOverlay.style.display = 'none';
                body.classList.remove('unfocused');
                 if (elementsToHideOnUnfocus) {
                      elementsToHideOnUnfocus.forEach(el => {
                           el.style.display = el._originalDisplay !== undefined ? el._originalDisplay : ''; // Restore original or revert to CSS default
                           delete el._originalDisplay;
                      });
                 }
           }
      } else {
          console.warn("globalSettings.js: #unfocused-overlay element not found, cannot apply Sneak Mode background.");
          disableSneakMode(); // Ensure listeners are off if element is missing
      }
      // --- End Sneak Mode Handling ---


      // Handle Particles.js toggle
      // ... (your existing initParticles and destroyParticles functions) ...
       if (typeof particlesJS !== 'undefined' && document.getElementById('particles-js')) {
         if (currentSettings.showParticles === 'on') {
           console.log(`globalSettings.js: Particles ON. Lines: ${currentSettings.showParticlesLines}. Initializing/Re-initializing particles.`);
           initParticles(currentSettings.showParticlesLines === 'on');
         } else {
            console.log("globalSettings.js: Particles OFF. Destroying particles.");
            destroyParticles();
         }
       } else if (document.getElementById('particles-js') && currentSettings.showParticles === 'on') {
            console.warn("globalSettings.js: particlesJS script not loaded or #particles-js element not available during applySettings, but showParticles is ON. Will attempt init on load.");
       } else if (document.getElementById('particles-js')) {
            console.log("globalSettings.js: particlesJS element found, but showParticles is OFF. Ensuring particles are off.");
             if (window.pJSDom && window.pJSDom.length > 0) {
                destroyParticles();
            }
       }


      // Dispatch a custom event to notify other scripts that settings have been applied
      console.log("globalSettings.js: Dispatching globalSettingsApplied event.");
      setTimeout(() => {
        document.body.dispatchEvent(new CustomEvent('globalSettingsApplied', { detail: { settings: currentSettings } }));
      }, 0);
    }


    // --- Sneak Mode Handlers (Updated to handle various elements) ---
    function handleWindowBlur() {
        const settings = window.getSettings();
        unfocusedOverlay = unfocusedOverlay || document.getElementById('unfocused-overlay');
        const body = document.body;
        // Select ALL elements that should be hidden when unfocused across different page types
        elementsToHideOnUnfocus = document.querySelectorAll('section.content-section:not(#settings), main.hub-container, #backBtn, #nameContainer, .game-frame-wrapper, #buttonContainer');

        if (settings.sneakModeApp !== 'off' && unfocusedOverlay && body) {
            console.log("Sneak Mode: Window blurred. Showing overlay and hiding content.");
            unfocusedOverlay.style.display = 'block'; // Show the overlay element
            body.classList.add('unfocused'); // Add class to body for CSS targeting

             // Hide the identified main content elements
             if (elementsToHideOnUnfocus) {
                 elementsToHideOnUnfocus.forEach(el => {
                      // Store the element's original display property before hiding it
                      el._originalDisplay = el.style.display || getComputedStyle(el).display;
                     el.style.display = 'none'; // Hide the element
                 });
             }
             // On blur, also remove pointer events from the overlay so the image doesn't block interaction if the user clicks the screen while unfocused
             // This allows clicking back into the window to regain focus.
             unfocusedOverlay.style.pointerEvents = 'auto';
        }
    }

    function handleWindowFocus() {
        unfocusedOverlay = unfocusedOverlay || document.getElementById('unfocused-overlay');
        const body = document.body;

        // Re-select elements just in case the DOM changed (defensive)
         elementsToHideOnUnfocus = document.querySelectorAll('section.content-section:not(#settings), main.hub-container, #backBtn, #nameContainer, .game-frame-wrapper, #buttonContainer');

        // Always hide the overlay and restore content when the window gains focus,
        // regardless of whether sneak mode is currently ON or OFF (to ensure cleanup).
        if (unfocusedOverlay && body) {
            console.log("Sneak Mode: Window focused. Hiding overlay and restoring content.");
            unfocusedOverlay.style.display = 'none'; // Hide the overlay element
            body.classList.remove('unfocused'); // Remove the body class

             // Restore the original display of the main content elements
             if (elementsToHideOnUnfocus) {
                 elementsToHideOnUnfocus.forEach(el => {
                     // Restore from the stored value, falling back to '' (CSS default) if no value was stored
                     el.style.display = (el._originalDisplay !== undefined && el._originalDisplay !== null && el._originalDisplay !== '') ? el._originalDisplay : ''; // Restore original or revert to CSS default
                     // Clean up the stored property
                     delete el._originalDisplay;
                 });
             }
             // When focused, the overlay should not block clicks
             unfocusedOverlay.style.pointerEvents = 'none';
        }
    }

    // Keep mouse handlers for scenarios where mouse leaves viewport but window keeps focus
    // Use a small delay to allow time for a potential blur event to register first
   function handleMouseLeaveDoc() {
        // Delay slightly
        setTimeout(() => {
             const settings = window.getSettings(); // Get latest settings
             // Check if sneak mode is still on AND the window still has focus
             if (settings.sneakModeApp !== 'off' && document.hasFocus()) {
                  // If mouse leaves *and* window is still focused, treat it like a blur for sneak mode purposes
                  handleWindowBlur(); // Use the blur handler logic to show overlay/hide content
                  console.log("Sneak Mode: Mouse left document (while focused). Showing overlay.");
             } else {
                 // If mouse left but window lost focus anyway, or sneak mode is off, no action needed here.
                 // The blur handler or disableSneakMode would have handled it.
                 // console.log("Sneak Mode: Mouse left document, but window does not have focus or sneak mode is off. No action.");
             }
        }, 50); // Small delay (adjust if needed)
   }

    // Mouse entering document area
   function handleMouseEnterDoc() {
       // When the mouse enters, always attempt to hide the overlay and show content.
       // This acts as a cleanup if the overlay was visible for any reason.
        const settings = window.getSettings(); // Get latest settings
       if (settings.sneakModeApp !== 'off' && !document.hasFocus()) {
            // If sneak mode is on and the window is *currently blurred*, focusing the window
            // should happen when the mouse enters, which will then trigger the focus handler.
            // Explicitly focus the window.
            window.focus();
             console.log("Sneak Mode: Mouse entered document while window blurred. Attempting window.focus().");
       } else if (settings.sneakModeApp !== 'off' && document.hasFocus()) {
           // If sneak mode is on and the window *already has focus*, just ensure the overlay is hidden.
           handleWindowFocus(); // Use the focus handler logic to hide overlay/show content
           console.log("Sneak Mode: Mouse entered document (while focused). Hiding overlay.");
       } else {
            // Sneak mode is off, ensure normal state.
            handleWindowFocus();
             console.log("Sneak Mode: Mouse entered document, but sneak mode is off. Hiding overlay (cleanup).");
       }
   }


   function enableSneakMode() {
       // Remove old listeners before adding new ones to prevent duplicates
       disableSneakMode(); // Clean up any existing listeners first

       // Add listeners
       // Use handleWindowBlur/Focus for window events (covers alt-tab, minimizing, clicking outside)
       window.addEventListener('blur', handleWindowBlur);
       window.addEventListener('focus', handleWindowFocus);
        // Use handleMouseLeaveDoc/MouseEnterDoc for document events (covers mouse leaving/entering the browser's content area while window stays focused)
       document.documentElement.addEventListener('mouseleave', handleMouseLeaveDoc);
       document.documentElement.addEventListener('mouseenter', handleMouseEnterDoc);


       // Store listener references (Keep these declarations)
       windowBlurListener = handleWindowBlur;
       windowFocusListener = handleWindowFocus;
       mouseLeaveListener = handleMouseLeaveDoc;
       mouseEnterListener = handleMouseEnterDoc;


       console.log("globalSettings.js: Sneak Mode listeners enabled (window blur/focus, document mouseleave/enter).");

        // Check initial focus state on enable (This is called by applySettings)
        // If the window is already blurred when sneak mode is enabled, apply the effect immediately
        if (!document.hasFocus()) {
            console.log("globalSettings.js: Sneak Mode enabled and window is already blurred. Triggering blur handler.");
            handleWindowBlur(); // Apply sneak mode immediately if window is already blurred
        } else {
             // If window is focused, ensure the overlay is hidden and content is visible
              unfocusedOverlay = unfocusedOverlay || document.getElementById('unfocused-overlay'); // Ensure ref fresh
              const body = document.body;
              // Select elements to hide on unfocus just to ensure they are visible if they exist
              elementsToHideOnUnfocus = document.querySelectorAll('section.content-section:not(#settings), main.hub-container, #backBtn, #nameContainer, .game-frame-wrapper, #buttonContainer');

              if (unfocusedOverlay && body) {
                   unfocusedOverlay.style.display = 'none';
                   body.classList.remove('unfocused');
                    if (elementsToHideOnUnfocus) {
                        elementsToHideOnUnfocus.forEach(el => {
                             el.style.display = el._originalDisplay !== undefined ? el._originalDisplay : ''; // Restore original or revert to CSS default
                             delete el._originalDisplay; // Clean up stored property
                        });
                    }
              }
        }
   }

   function disableSneakMode() {
       // Remove all listeners if they exist
       if (windowBlurListener) {
           window.removeEventListener('blur', windowBlurListener);
           windowBlurListener = null;
       }
       if (windowFocusListener) {
           window.removeEventListener('focus', windowFocusListener);
           windowFocusListener = null;
       }
       if (mouseLeaveListener) {
           document.documentElement.removeEventListener('mouseleave', mouseLeaveListener);
           mouseLeaveListener = null;
       }
       if (mouseEnterListener) {
           document.documentElement.removeEventListener('mouseenter', mouseEnterListener);
           mouseEnterListener = null;
       }

       console.log("globalSettings.js: Sneak Mode listeners disabled.");

       // Ensure the overlay is hidden and content is visible when sneak mode is turned OFF
       unfocusedOverlay = unfocusedOverlay || document.getElementById('unfocused-overlay'); // Ensure ref fresh
       const body = document.body;
        // Select elements to hide on unfocus to ensure they are restored
        elementsToHideOnUnfocus = document.querySelectorAll('section.content-section:not(#settings), main.hub-container, #backBtn, #nameContainer, .game-frame-wrapper, #buttonContainer');

       if (unfocusedOverlay && body) {
           unfocusedOverlay.style.display = 'none'; // Hide the overlay element
           body.classList.remove('unfocused'); // Remove the body class

            // Restore the original display of the main content elements
            if (elementsToHideOnUnfocus) {
                elementsToHideOnUnfocus.forEach(el => {
                    // Restore from stored value, fallback to ''
                    el.style.display = (el._originalDisplay !== undefined && el._originalDisplay !== null && el._originalDisplay !== '') ? el._originalDisplay : '';
                    delete el._originalDisplay; // Clean up stored property
                });
            }
             // Ensure overlay doesn't block clicks when disabled
            unfocusedOverlay.style.pointerEvents = 'none';
       }
   }
   // --- END Sneak Mode Handlers ---


    // Initialize Particles.js (Moved inside the IIFE)
    function initParticles(enableLines) {
      if (typeof particlesJS === 'undefined' || !document.getElementById('particles-js')) {
           console.warn("initParticles called, but particlesJS script or element not available. Cannot initialize.");
          return;
      }

      // Destroy existing instance before creating a new one
      if (window.pJSDom && window.pJSDom.length > 0 && window.pJSDom[0]?.pJS) {
         const currentInstance = window.pJSDom[0]?.pJS;
         const currentLineState = currentInstance?.particles?.line_linked?.enable;
         const shouldHaveLines = window.getSettings()?.showParticlesLines === 'on'; // Use optional chaining and default settings

         // Only re-init if the line state needs to change OR if the instance seems broken/missing pJS property
         if (currentInstance && currentInstance.particles && currentInstance.particles.line_linked && currentInstance.particles.line_linked.enable === shouldHaveLines) {
              console.log("initParticles: Particles already initialized with correct line state. Skipping re-initialization.");
             return;
         } else if (currentInstance) {
              console.log(`initParticles: Particles instance exists but needs re-init (line state needs change or instance broken). Destroying before re-init.`);
              destroyParticles(); // Destroy to apply new settings
         } else {
           console.log("initParticles: No existing particles instance found, proceeding with init.");
         }
      } else {
            console.log("initParticles: No existing particles instance found, proceeding with init.");
      }

       // Only initialize if showParticles is ON
       const currentSettings = window.getSettings();
       if (currentSettings?.showParticles !== 'on') { // Use optional chaining
            console.log("initParticles: Particles are set to OFF, skipping initialization after checks.");
            return;
       }

      try {
           console.log(`initParticles: Initializing particlesJS for #particles-js with lines enabled: ${enableLines}.`);
           particlesJS('particles-js', {
             "particles": {
               "number": {"value": 80, "density": {"enable": true, "value_area": 800}},
               "color": {"value": "#ffffff"},
               "shape": {"type": "circle", "stroke": {"width": 0, "color": "#000000"}, "polygon": {"nb_sides": 5}, "image": {"src": "img/github.svg", "width": 100, "height": 100}},
               "opacity": {"value": 0.5, "random": true, "anim": {"enable": false, "speed": 1, "opacity_min": 0.1, "sync": false}},
               "size": {"value": 3, "random": true, "anim": {"enable": false, "speed": 40, "size_min": 0.1, "sync": false}},
               "line_linked": {
                 "enable": enableLines, // Use the parameter to toggle lines
                 "distance": 150,
                 "color": "#ffffff",
                 "opacity": 0.4,
                 "width": 1
               },
               "move": {"enable": true, "speed": 4, "direction": "none", "random": false, "straight": false, "out_mode": "out", "bounce": false, "attract": {"enable": false, "rotateX": 600, "rotateY": 1200}}
             },
             "interactivity": {
               "detect_on": "canvas",
               "events": {
                 "onhover": {"enable": true, "mode": "repulse"},
                 "onclick": {"enable": true, "mode": "push"},
                 "resize": true
               },
               "modes": {
                 "grab": {"distance": 400, "line_linked": {"opacity": 1}},
                 "bubble": {"distance": 400, "size": 40, "duration": 2, "opacity": 8, "speed": 3},
                 "repulse": {"distance": 200, "duration": 0.4},
                 "push": {"particles_nb": 4},
                 "remove": {"particles_nb": 2}
               }
             },
             "retina_detect": true
           });
          console.log(`initParticles: particlesJS initialized.`);
       } catch (e) {
           console.error("initParticles: Error initializing particlesJS:", e);
       }
    }

    // Destroy Particles.js instance (Moved inside the IIFE)
    function destroyParticles() {
     // Check if pJSDom exists and has instances
     if (window.pJSDom && window.pJSDom.length > 0 && window.pJSDom[0]?.pJS) { // Use optional chaining
        console.log("globalSettings.js: destroyParticles: Attempting to destroy particles instance.");
        try {
             // Use the built-in destroy method if available
             if (window.pJSDom[0].pJS.fn.vendors.destroypJS) {
               window.pJSDom[0].pJS.fn.vendors.destroypJS();
               console.log("globalSettings.js: destroyParticles: particlesJS instance destroyed.");
             } else {
                 console.warn("globalSettings.js: destroyParticles: pJSDom instance found, but destroy method is missing. Clearing pJSDom array.");
                  window.pJSDom = []; // Clear array even if destroy fails
             }
        } catch (e) {
            console.error("globalSettings.js: destroyParticles: Error destroying particlesJS instance:", e);
             window.pJSDom = []; // Ensure array is cleared on error
        } finally {
            // Ensure the canvas element is removed/cleared regardless of method success
             const particlesDiv = document.getElementById('particles-js');
             if (particlesDiv) {
                  const canvas = particlesDiv.querySelector('canvas');
                  if (canvas) {
                       console.log("globalSettings.js: destroyParticles: Removing particles canvas element.");
                       canvas.remove();
                  }
                  // Also clear the inner HTML of the particles div
                  particlesDiv.innerHTML = '';
             }
        }
     } else {
         console.log("globalSettings.js: destroyParticles: No particles instance to destroy or instance is invalid.");
          // Even if no instance, ensure the canvas is removed if it exists
          const particlesDiv = document.getElementById('particles-js');
           if (particlesDiv) {
                const canvas = particlesDiv.querySelector('canvas');
                if (canvas) {
                     console.log("globalSettings.js: destroyParticles: Removing particle canvas element (no pJSDom instance found).");
                     canvas.remove();
                }
                particlesDiv.innerHTML = ''; // Clear inner HTML
           }
     }
    }


    // Expose necessary functions to the global scope
    window.saveSetting = function(key, value) {
      console.log(`globalSettings.js: Attempting to save setting: ${key} = ${value}`);
      const settingsToSave = { ...loadSettings() }; // Use loadSettings to get existing state first
      if (settingsToSave.hasOwnProperty(key)) {
        settingsToSave[key] = value;
        try {
          localStorage.setItem('userSettings', JSON.stringify(settingsToSave));
          console.log(`globalSettings.js: Successfully saved setting: ${key}=${value}`);
        } catch (e) {
          console.error("globalSettings.js: Error saving setting:", e);
        }
        console.log(`globalSettings.js: Calling applySettings after saving ${key}.`);
        applySettings(settingsToSave); // This will trigger the globalSettingsApplied event
      } else {
           console.warn(`globalSettings.js: Attempted to save unknown setting key: "${key}"`);
      }
    };

    window.getSettings = function() {
       return { ...currentSettings }; // Return a copy
    };

    window.clearSettings = function() {
      console.log("globalSettings.js: Clearing settings...");
      localStorage.removeItem('userSettings');
      console.log("globalSettings.js: Calling applySettings after clearing.");
      applySettings(defaultSettings); // Apply default settings immediately
      console.log("globalSettings.js: Settings cleared. Applied default settings.");
       // Dispatch globalSettingsReset event
       setTimeout(() => {
          document.body.dispatchEvent(new CustomEvent('globalSettingsReset'));
       }, 0);
    };

    // Listen for localStorage 'storage' event to sync settings across tabs/windows
    window.addEventListener('storage', (event) => {
        if (event.key === 'userSettings') {
            console.log('globalSettings.js: Storage event detected. Reloading and applying settings.');
            // Reload and apply settings when storage changes (from another tab/window)
            const reloadedSettings = loadSettings(); // loadSettings updates currentSettings internally
            applySettings(reloadedSettings); // Apply the new settings
        }
    });
     console.log("globalSettings.js: Added localStorage 'storage' event listener.");


    // Initial load and apply settings when the DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
      console.log("globalSettings.js: DOMContentLoaded. Loading and applying initial settings.");
      const initialSettings = loadSettings(); // loadSettings updates currentSettings internally
      console.log("globalSettings.js: Calling applySettings for initial load.");
      applySettings(initialSettings); // This will trigger the globalSettingsApplied event
      console.log("globalSettings.js: Initial settings applied on DOMContentLoaded by globalSettings.js.");
    });

     // Ensure particles are destroyed if the window is unloaded/closed
     window.addEventListener('beforeunload', () => {
          console.log("globalSettings.js: beforeunload event. Destroying particles.");
          destroyParticles();
          // Note: Listeners added via enableSneakMode will also be automatically cleaned up by the browser
          // when the window is unloaded.
     });

     // If particlesJS script loads AFTER DOMContentLoaded, manually init if needed
     // This handles cases where the particlesJS script is loaded async or deferred
     window.addEventListener('load', () => {
          if (typeof particlesJS !== 'undefined' && document.getElementById('particles-js')) {
              const settings = loadSettings(); // Get current settings
              // Check if particles should be ON and there's no running instance
              if (settings.showParticles === 'on' && (!window.pJSDom || window.pJSDom.length === 0 || !window.pJSDom[0]?.pJS)) {
                  console.log("globalSettings.js: particlesJS loaded late, initializing particles based on settings.");
                  initParticles(settings.showParticlesLines === 'on');
              } else if (settings.showParticles !== 'on' && (window.pJSDom && window.pJSDom.length > 0 && window.pJSDom[0]?.pJS)) {
                   // If particles should be OFF but seem initialized (e.g. via browser back button cache)
                   console.log("globalSettings.js: particlesJS loaded late, particles should be OFF but seem initialized. Destroying.");
                   destroyParticles();
              } else if (settings.showParticles === 'on' && window.pJSDom && window.pJSDom.length > 0 && window.pJSDom[0]?.pJS) {
                   // If particles are ON and already initialized, just ensure line state is correct
                   const currentInstance = window.pJSDom[0].pJS;
                   const currentLineState = currentInstance.particles?.line_linked?.enable;
                   const shouldHaveLines = settings.showParticlesLines === 'on';
                   if (currentLineState !== shouldHaveLines) {
                       console.log("globalSettings.js: particlesJS loaded late, particles on but line state incorrect. Re-initializing for lines.");
                       initParticles(shouldHaveLines);
                   } else {
                        console.log("globalSettings.js: particlesJS loaded late, particles ON with correct line state. No action needed.");
                   }
              } else {
                  console.log("globalSettings.js: window 'load' event - particlesJS not defined or #particles-js element missing. Cannot check particles state.");
              }
          } else {
               console.log("globalSettings.js: window 'load' event - particlesJS not defined or #particles-js element missing. Cannot check particles state.");
          }
     });


})(); // Immediately invoke the IIFE