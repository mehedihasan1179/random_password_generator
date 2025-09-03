//generate a password using a provided pool string (secure random)
function applyCharacterColors(password) {
  const passwordOutput = document.getElementById("password");
  
  // Clear previous content
  passwordOutput.innerHTML = '';
  
  // If no password or empty, just set the text
  if (!password || password === "No character selected.") {
    passwordOutput.textContent = password;
    return;
  }
  
  // Create a span for each character with appropriate color class
  for (let i = 0; i < password.length; i++) {
    const char = password[i];
    const span = document.createElement('span');
    span.textContent = char;
    
    // Determine character type and apply appropriate class
    if (/[A-Z]/.test(char)) {
      span.className = 'char-uppercase';
    } else if (/[a-z]/.test(char)) {
      span.className = 'char-lowercase';
    } else if (/[0-9]/.test(char)) {
      span.className = 'char-number';
    } else {
      span.className = 'char-symbol';
    }
    
    passwordOutput.appendChild(span);
  }
}

function generateFromPool(pool, length) {
  if (!pool || pool.length === 0) return "";

  const chars = Array.from(pool);
  let password = "";

  // use crypto.getRandomValues for better randomness
  const cryptoObj = window.crypto || window.msCrypto;
  const max = chars.length;

  for (let i = 0; i < length; i++) {
    const r = cryptoObj.getRandomValues(new Uint32Array(1))[0] % max;
    password += chars[r];
  }
  return password;
}


// function generatePasswordButton() {
//   const lengthInput = document.getElementById("length");
//   const passwordOutput = document.getElementById("password");

//   const length = parseInt(lengthInput.value, 10) || 12;

//   // build pool from saved customSelections + checkboxes
//   const pool = buildCharacterPool();

//   if (!pool) {
//     // no characters available -> show message and clear output
//     passwordOutput.textContent = "No character selected.";
//     // optionally show your alert UX here
//     return;
//   }

//   const password = generateFromPool(pool, length);
//   applyCharacterColors(password);

//   // update strength meter if you have one
//   if (typeof updateStrengthMeter === "function") updateStrengthMeter(password);
// }



// Add event listener to the generate password button
const generateButton = document.getElementById("generate");
generateButton.addEventListener("click", generatePasswordButton);

// Add event listener to the copy button
const copyButton = document.getElementById("copy");
copyButton.addEventListener("click", copyPassword);

// extra works

const alert = document.querySelector(".alert");

copyButton.addEventListener("click", () => {
  alert.classList.remove("hide");
  alert.classList.add("show");
  setTimeout(() => {
    alert.classList.add("hide");
  }, 3000);
});


// Password Strength Meter
function calculateStrength(password) {
  let strength = 0;

  // length check
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;

  // character variety checks
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  return strength; // 0–6
}


function updateStrengthMeter(password) {
  const strengthBar = document.getElementById("strengthBar");
  const strengthText = document.getElementById("strengthText");

  let strength = 0;

  // check which checkboxes are enabled
  const uppercaseChecked = document.getElementById("uppercase").checked;
  const lowercaseChecked = document.getElementById("lowercase").checked;
  const numbersChecked = document.getElementById("numbers").checked;
  const symbolsChecked = document.getElementById("symbols").checked;

  // if no checkbox selected → reset & exit
  if (!uppercaseChecked && !lowercaseChecked && !numbersChecked && !symbolsChecked) {
    strengthBar.style.width = "0";
    strengthBar.style.backgroundColor = "transparent";
    strengthText.textContent = "";
    return;
  }

  // check regex matches
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  // also check password length
  if (password.length >= 12) strength++;

  // update meter
  const strengthLevels = ["Weak Password. Try adding more characters.", "Fair Password. Could be stronger.", "Moderate", "Good Enough", "Strong Password!"];
  const colors = ["#ff4d4d", "#ff944d", "#ffcc00", "#66cc66", "#339933"];

  strengthBar.style.width = (strength * 20) + "%";
  strengthBar.style.backgroundColor = colors[strength - 1] || "transparent";
  strengthText.textContent = strengthLevels[strength - 1] || "";
}


// Default character sets
const charSets = {
  uppercase: [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"],
  lowercase: [..."abcdefghijklmnopqrstuvwxyz"],
  numbers: [..."0123456789"],
  symbols: [..."!@#$%^&*()_+-=[]{}|;:'\",.<>/?`~"],
};

// Load saved preferences or default (all active)
let customSelections = JSON.parse(localStorage.getItem("customSelections")) || {
  uppercase: [...charSets.uppercase],
  lowercase: [...charSets.lowercase],
  numbers: [...charSets.numbers],
  symbols: [...charSets.symbols],
};

// Modal elements
const modal = document.getElementById("customizeModal");
const modalTitle = document.getElementById("modalTitle");
const charGrid = document.getElementById("charGrid");
const selectAllBtn = document.getElementById("selectAllBtn");
const cancelBtn = document.getElementById("cancelBtn");
const saveBtn = document.getElementById("saveBtn");

let currentType = null;
let tempSelection = [];

// Open modal
document.querySelectorAll(".customize-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    currentType = btn.dataset.type;
    modalTitle.textContent = "Customize " + currentType;
    modal.classList.add("active");

    // load saved or default
    tempSelection = [...customSelections[currentType]];
    renderGrid();
  });
});

//Render character grid
function renderGrid() {
  charGrid.innerHTML = "";
  charSets[currentType].forEach(ch => {
    const div = document.createElement("div");
    div.textContent = ch;
    if (tempSelection.includes(ch)) div.classList.add("active");

    div.addEventListener("click", () => {
      if (div.classList.contains("active")) {
        div.classList.remove("active");
        tempSelection = tempSelection.filter(c => c !== ch);
      } else {
        div.classList.add("active");
        tempSelection.push(ch);
      }
    });

    charGrid.appendChild(div);
  });
}

// Select All
selectAllBtn.addEventListener("click", () => {
  tempSelection = [...charSets[currentType]];
  renderGrid();
});

// Cancel
cancelBtn.addEventListener("click", () => {
  modal.classList.remove("active");
});

// Save
saveBtn.addEventListener("click", () => {
  customSelections[currentType] = [...tempSelection];
  localStorage.setItem("customSelections", JSON.stringify(customSelections));
  modal.classList.remove("active");
});


// returns a string containing only the characters currently selected & saved
function buildCharacterPool() {
  const poolArr = [];
  if (document.getElementById("uppercase").checked) poolArr.push(...(customSelections.uppercase || []));
  if (document.getElementById("lowercase").checked) poolArr.push(...(customSelections.lowercase || []));
  if (document.getElementById("numbers").checked)   poolArr.push(...(customSelections.numbers || []));
  if (document.getElementById("symbols").checked)   poolArr.push(...(customSelections.symbols || []));

  // dedupe just in case and return as string
  return Array.from(new Set(poolArr)).join('');
}

const ellipsisIcon = document.querySelector('.fa-ellipsis-vertical');
const dropdownMenu = document.querySelector('.dropdown-menu');
const dropdownItems = document.querySelectorAll('.dropdown-item');

    // Toggle dropdown menu visibility on icon click
ellipsisIcon.addEventListener('click', (e) => {
  e.stopPropagation();
  dropdownMenu.classList.toggle('active');
  // Close themes submenu when main menu is toggled
  const existingSubmenu = document.querySelector('.themes-submenu');
  if (existingSubmenu) {
    existingSubmenu.classList.remove('active');
  }
});

// Handle dropdown item clicks
dropdownItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.stopPropagation();

    // If clicking Themes, handle submenu
  if (item.dataset.submenu === 'themes') {
    let submenu = document.querySelector('.themes-submenu');
    
    // If submenu exists, toggle its visibility
    if (submenu) {
      submenu.classList.toggle('active');
      return;
    }

    // Create new submenu if it doesn't exist
    submenu = document.createElement('div');
    submenu.classList.add('themes-submenu');
    submenu.innerHTML = `
      <div class="submenu-item">Dark</div>
      <div class="submenu-item">Light</div>
      <div class="submenu-item">System</div>
    `;
    dropdownMenu.appendChild(submenu);

    // Show submenu
    submenu.classList.add('active');

    // Handle submenu item clicks
    const submenuItems = submenu.querySelectorAll('.submenu-item');
    submenuItems.forEach(subItem => {
      subItem.addEventListener('click', (e) => {
        e.stopPropagation();
        // Remove active class from all submenu items
        submenuItems.forEach(i => i.classList.remove('active'));
        // Add active class to clicked submenu item
        subItem.classList.add('active');
        // Close submenu after selection
        submenu.classList.remove('active');
      });
    });
    } else {
      // If clicking non-Themes item, remove active class from all dropdown items
      dropdownItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      // Close themes submenu if it exists
      const existingSubmenu = document.querySelector('.themes-submenu');
      if (existingSubmenu) {
        existingSubmenu.classList.remove('active');
      }
    }
  });
});

// Close dropdown and submenu when clicking outside
document.addEventListener('click', (e) => {
  if (!dropdownMenu.contains(e.target) && !ellipsisIcon.contains(e.target)) {
    dropdownMenu.classList.remove('active');
    const existingSubmenu = document.querySelector('.themes-submenu');
    if (existingSubmenu) {
      existingSubmenu.classList.remove('active');
    }
  }
});



////////////////// # Save Password Button //////////////////////////////////////

const saveButton = document.querySelector('.save-button');
const backButton = document.querySelector('.back-button');
const card = document.querySelector('.card');
const savedPasswordsSection = document.querySelector('.saved-passwords');


// Add this variable at the top with your other declarations
// let savedPasswords = JSON.parse(localStorage.getItem("savedPasswords")) || [];
let savedPasswords = JSON.parse(localStorage.getItem("savedPasswords")) || [];
savedPasswords = savedPasswords.map(pwd => ({ 
  ...pwd, 
  pinned: pwd.pinned || false 
}));
localStorage.setItem("savedPasswords", JSON.stringify(savedPasswords));

// Modify the copyPassword function to save the password
function copyPassword() {
  const passwordOutput = document.getElementById("password");
  const passwordText = passwordOutput.textContent;

  if (passwordText && passwordText !== "No character selected.") {
    navigator.clipboard
      .writeText(passwordText)
      .then(() => {
        // Save the password with timestamp
        savePassword(passwordText);
        
        // Show alert
        const alert = document.querySelector(".alert");
        alert.classList.remove("hide");
        alert.classList.add("show");
        setTimeout(() => {
          alert.classList.add("hide");
        }, 3000);
      })
      .catch(() => {
        alert("Failed to copy password.");
      });
  }
}


function savePassword(password) {
  // Check if password already exists in saved passwords
  const passwordExists = savedPasswords.some(item => item.password === password);
  
  if (passwordExists) {
    // If password already exists, don't add it again
    console.log("Password already saved, not adding duplicate");
    return;
  }
  
  const timestamp = new Date().toLocaleString();
  const passwordObj = {
    password: password,
    timestamp: timestamp,
    visible: false // Track if password is visible or masked
  };
  
  savedPasswords.unshift(passwordObj); // Add to beginning of array (newest first)
  localStorage.setItem("savedPasswords", JSON.stringify(savedPasswords));
  
  // Update the saved passwords list if it's visible
  if (savedPasswordsSection.style.display === 'block') {
    renderSavedPasswords();
  }
}



// Update the renderSavedPasswords function to include pin status
function renderSavedPasswords() {
  const savedPasswordsList = document.getElementById("savedPasswordsList");
  savedPasswordsList.innerHTML = '';
  
  // Sort passwords: pinned first, then by timestamp (newest first)
  const sortedPasswords = [...savedPasswords].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.timestamp) - new Date(a.timestamp);
  });
  
  sortedPasswords.forEach((item, index) => {
    const passwordItem = document.createElement('div');
    passwordItem.className = 'password-item';
    if (item.pinned) {
      passwordItem.classList.add('pinned');
    }
    
    // Create password display (masked by default)
    const passwordDisplay = item.visible ? item.password : '•'.repeat(item.password.length);
    
    passwordItem.innerHTML = `
      <div class="password-content">
        <span class="password-text">${passwordDisplay}</span>
        <span class="password-time">${item.timestamp}</span>
        ${item.pinned ? '<i class="fa-solid fa-thumbtack pinned-icon"></i>' : ''}
      </div>
      <div class="password-actions">
        <button class="toggle-visibility" data-index="${savedPasswords.indexOf(item)}">
          <i class="fa-solid ${item.visible ? 'fa-eye-slash' : 'fa-eye'}"></i>
        </button>
        <button class="password-menu" data-index="${savedPasswords.indexOf(item)}">
          <i class="fa-solid fa-ellipsis-vertical"></i>
        </button>
      </div>
    `;
    
    savedPasswordsList.appendChild(passwordItem);
  });
  
  // Add event listeners for the new buttons
  addSavedPasswordEventListeners();
}

// Add these variables at the top with your other declarations
let passwordContextMenu = null;
let currentPasswordIndex = null;


// Initialize the context menu
function initPasswordContextMenu() {
  if (!document.getElementById('passwordMenu')) {
    const menu = document.createElement('div');
    menu.id = 'passwordMenu';
    menu.className = 'password-context-menu';
    menu.innerHTML = `
      <div class="menu-item" data-action="edit">Edit</div>
      <div class="menu-item" data-action="delete">Delete</div>
      <div class="menu-item" data-action="pin">Pin/Unpin</div>
    `;
    document.body.appendChild(menu);
  }
  
  // Add event listeners to menu items
  const menuItems = document.querySelectorAll('#passwordMenu .menu-item');
  menuItems.forEach(item => {
    item.replaceWith(item.cloneNode(true));
  });
  
  document.querySelectorAll('#passwordMenu .menu-item').forEach(item => {
    item.addEventListener('click', handleMenuAction);
  });
  
  passwordContextMenu = document.getElementById('passwordMenu');
}

// Function to show the context menu
function showPasswordContextMenu(index, x, y) {
  currentPasswordIndex = index;
  
  if (!passwordContextMenu) {
    initPasswordContextMenu();
  }
  
  passwordContextMenu.style.left = x + 'px';
  passwordContextMenu.style.top = y + 'px';
  passwordContextMenu.classList.add('active');
  
  const pinItem = passwordContextMenu.querySelector('[data-action="pin"]');
  if (savedPasswords[index].pinned) {
    pinItem.textContent = 'Unpin';
  } else {
    pinItem.textContent = 'Pin';
  }
}

// Function to handle menu actions
function handleMenuAction(e) {
  const action = e.target.dataset.action;
  
  if (currentPasswordIndex === null) return;
  
  switch(action) {
    case 'edit':
      editPassword(currentPasswordIndex);
      break;
    case 'delete':
      deletePassword(currentPasswordIndex);
      break;
    case 'pin':
      togglePinPassword(currentPasswordIndex);
      break;
  }
  
  passwordContextMenu.classList.remove('active');
}

// Function to edit a password
function editPassword(index) {
  const newPassword = prompt('Edit your password:', savedPasswords[index].password);
  
  if (newPassword !== null && newPassword.trim() !== '') {
    savedPasswords[index].password = newPassword.trim();
    savedPasswords[index].timestamp = new Date().toLocaleString();
    localStorage.setItem("savedPasswords", JSON.stringify(savedPasswords));
    renderSavedPasswords();
  }
}

// Function to delete a password
function deletePassword(index) {
  if (confirm('Are you sure you want to delete this password?')) {
    savedPasswords.splice(index, 1);
    localStorage.setItem("savedPasswords", JSON.stringify(savedPasswords));
    renderSavedPasswords();
  }
}

// Function to toggle pin status
function togglePinPassword(index) {
  savedPasswords[index].pinned = !savedPasswords[index].pinned;
  localStorage.setItem("savedPasswords", JSON.stringify(savedPasswords));
  renderSavedPasswords();
}

// Update the addSavedPasswordEventListeners function
function addSavedPasswordEventListeners() {
  // Remove any existing listeners first
  document.querySelectorAll('.password-menu').forEach(button => {
    button.replaceWith(button.cloneNode(true));
  });
  
  // Menu buttons
  document.querySelectorAll('.password-menu').forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation();
      const index = parseInt(this.dataset.index);
      const rect = this.getBoundingClientRect();
      showPasswordContextMenu(index, rect.right, rect.bottom);
    });
  });
  
  // Close context menu when clicking elsewhere
  document.addEventListener('click', function(e) {
    if (passwordContextMenu && passwordContextMenu.classList.contains('active') && 
        !passwordContextMenu.contains(e.target) && 
        !e.target.closest('.password-menu')) {
      passwordContextMenu.classList.remove('active');
    }
  });
  
  // Toggle visibility buttons
  document.querySelectorAll('.toggle-visibility').forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation();
      const index = parseInt(this.dataset.index);
      savedPasswords[index].visible = !savedPasswords[index].visible;
      localStorage.setItem("savedPasswords", JSON.stringify(savedPasswords));
      renderSavedPasswords();
    });
  });
  
  // Copy saved passwords when clicked
  document.querySelectorAll('.password-content').forEach(item => {
    item.addEventListener('click', function() {
      const index = parseInt(this.closest('.password-item').querySelector('.toggle-visibility').dataset.index);
      navigator.clipboard.writeText(savedPasswords[index].password)
        .then(() => {
          alert("Password copied to clipboard!");
        })
        .catch(() => {
          alert("Failed to copy password.");
        });
    });
  });
}

// Initialize the context menu when the page loads
document.addEventListener('DOMContentLoaded', function() {
  initPasswordContextMenu();
  
  // Re-initialize context menu after rendering saved passwords
  const originalRender = renderSavedPasswords;
  renderSavedPasswords = function() {
    originalRender();
    initPasswordContextMenu();
  };
  
  if (savedPasswordsSection.style.display === 'block') {
    renderSavedPasswords();
  }
});



// Update the saveButton event listener to render passwords
saveButton.addEventListener('click', function() {
  // Hide the card
  card.style.display = 'none';
  
  // Show the saved passwords section
  savedPasswordsSection.style.display = 'block';
  
  // Render saved passwords
  renderSavedPasswords();
});


backButton.addEventListener('click', function() {
  // Show the card
  card.style.display = 'block';
  
  // Hide the saved passwords section
  savedPasswordsSection.style.display = 'none';
});


// Get the modal element by its ID
const gearIcon = document.querySelector('.fa-gear');
const gearModal = document.getElementById('gearModal');
const cancelGearBtn = document.getElementById('cancelGearBtn');
const saveGearBtn = document.getElementById('saveGearBtn');
const defaultBtn = document.getElementById('defaultBtn');

const uppercaseSelect = document.getElementById("uppercaseSelect");
const lowercaseSelect = document.getElementById("lowercaseSelect");
const numberSelect    = document.getElementById("numberSelect");
const symbolSelect    = document.getElementById("symbolSelect");

// Open modal when clicking gear
// gearIcon.addEventListener('click', () => {
//   gearModal.style.display = 'flex';
// });

// gearIcon.addEventListener('click', () => {
//   if (gearIcon.classList.contains('disabled')) return;
  
//   // Get selected options
//   const selectedOptions = [];
//   if (document.getElementById("uppercase").checked) selectedOptions.push("uppercase");
//   if (document.getElementById("lowercase").checked) selectedOptions.push("lowercase");
//   if (document.getElementById("numbers").checked) selectedOptions.push("numbers");
//   if (document.getElementById("symbols").checked) selectedOptions.push("symbols");
  
//   // Get current length
//   const length = parseInt(document.getElementById("length").value, 10) || 12;
  
//   // Calculate default distribution if no custom distribution exists
//   const distribution = customDistribution || calculateDefaultDistribution(length, selectedOptions);
  
//   // Update sliders based on distribution
//   document.getElementById("uppercaseSelect").value = distribution.uppercase || 0;
//   document.getElementById("lowercaseSelect").value = distribution.lowercase || 0;
//   document.getElementById("numberSelect").value = distribution.numbers || 0;
//   document.getElementById("symbolSelect").value = distribution.symbols || 0;
  
//   // Update display values
//   updateSliderValues();
  
//   // Show the modal
//   gearModal.style.display = 'flex';
// });


// Close modal on cancel
cancelGearBtn.addEventListener('click', () => {
  gearModal.style.display = 'none';
});

// Save action
// saveGearBtn.addEventListener("click", () => {
//   customSelections.uppercase = [...uppercaseSelect.value];
//   customSelections.lowercase = [...lowercaseSelect.value];
//   customSelections.numbers   = [...numberSelect.value];
//   customSelections.symbols   = [...symbolSelect.value];

//   // Save to localStorage
//   localStorage.setItem("customSelections", JSON.stringify(customSelections));

 
//   gearModal.style.display = "none";
// });

// Default action
// defaultBtn.addEventListener("click", () => {
//   customSelections.uppercase = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
//   customSelections.lowercase = [..."abcdefghijklmnopqrstuvwxyz"];
//   customSelections.numbers   = [..."0123456789"];
//   customSelections.symbols   = [..."!@#$%^&*()_+-=[]{}|;:'\",.<>/?`~"];

//   localStorage.setItem("customSelections", JSON.stringify(customSelections));

//   uppercaseSelect.value = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
//   lowercaseSelect.value = "abcdefghijklmnopqrstuvwxyz";
//   numberSelect.value    = "0123456789";
//   symbolSelect.value    = "!@#$%^&*()_+-=[]{}|;:'\",.<>/?`~";

//   alert("Reset to Default ⚙️");
// });

// saveGearBtn.addEventListener("click", () => {
//   // Get the values from sliders
//   const uppercaseCount = parseInt(document.getElementById("uppercaseSelect").value, 10);
//   const lowercaseCount = parseInt(document.getElementById("lowercaseSelect").value, 10);
//   const numbersCount = parseInt(document.getElementById("numberSelect").value, 10);
//   const symbolsCount = parseInt(document.getElementById("symbolSelect").value, 10);
  
//   // Calculate total from sliders
//   const totalFromSliders = uppercaseCount + lowercaseCount + numbersCount + symbolsCount;
//   const length = parseInt(document.getElementById("length").value, 10) || 12;
  
//   // Validate that the sum matches the length
//   if (totalFromSliders !== length) {
//       alert(`The sum of character types (${totalFromSliders}) must equal the password length (${length}).`);
//       return;
//   }
  
//   // Store the custom distribution (but don't save to localStorage)
//   customDistribution = {
//       uppercase: uppercaseCount,
//       lowercase: lowercaseCount,
//       numbers: numbersCount,
//       symbols: symbolsCount
//   };
  
//   // Hide the modal
//   gearModal.style.display = "none";
// });

// Get all sliders
// Sliders
const sliders = document.querySelectorAll('#gearModal input[type="range"]');
const lengthSelect = document.getElementById("length");
// Default length span
const defaultLengthSpan = document.getElementById("defaultLength");
// Total display
const totalValueDisplay = document.getElementById("totalValue");

function updateSliderValues() {
  let total = 0;

  sliders.forEach(slider => {
    let valueSpanId = slider.id.replace("Select", "") + "Value"; 
    const valueSpan = document.getElementById(valueSpanId);
    if (valueSpan) {
      valueSpan.textContent = slider.value;
    }
    total += parseInt(slider.value, 10);
  });

  const defaultLength = parseInt(defaultLengthSpan.textContent, 10);
  if (totalValueDisplay) {
    totalValueDisplay.textContent = `${total} / ${lengthSelect.value}`;
  }

  if (total === defaultLength) {
    saveGearBtn.disabled = false;
    cancelGearBtn.disabled = true;
  } else {
    saveGearBtn.disabled = true;
    cancelGearBtn.disabled = false;
  }
}

document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
  checkbox.addEventListener('change', () => {
      // Clear custom distribution when selection changes
      customDistribution = null;
      updateGearIconState();
      // Regenerate password with new settings
      generatePasswordButton();
  });
});

// Add event listener to length selector
document.getElementById('length').addEventListener('change', () => {
  // Clear custom distribution when length changes
  customDistribution = null;
  // Regenerate password with new length
  generatePasswordButton();
});


function updateDefaultLength() {
  defaultLengthSpan.textContent = lengthSelect.value;
}

// Update on change
lengthSelect.addEventListener("change", updateDefaultLength);
updateDefaultLength();

// Event listeners
sliders.forEach(slider => {
  slider.addEventListener("input", updateSliderValues);
});

// Initialize on load
updateSliderValues();




// Close when clicking outside modal content
window.addEventListener('click', (e) => {
  if (e.target === gearModal) {
    gearModal.style.display = 'none';
  }
});



// Add this function to handle character distribution
// function distributeCharacters(length, selectedOptions) {
//   const distribution = {};
//   const optionCount = selectedOptions.length;
  
//   if (optionCount === 0) return {};
  
//   // Calculate base distribution
//   const baseCount = Math.floor(length / optionCount);
//   let remainder = length % optionCount;
  
//   // Initialize distribution
//   selectedOptions.forEach(option => {
//     distribution[option] = baseCount;
//   });
  
//   // Distribute remainder
//   for (let i = 0; i < remainder; i++) {
//     const option = selectedOptions[i % selectedOptions.length];
//     distribution[option]++;
//   }
  
//   return distribution;
// }

// // Update the generatePasswordButton function to use distribution
// function generatePasswordButton() {
//   const lengthInput = document.getElementById("length");
//   const passwordOutput = document.getElementById("password");

//   const length = parseInt(lengthInput.value, 10) || 12;

//   // Get selected options
//   const selectedOptions = [];
//   if (document.getElementById("uppercase").checked) selectedOptions.push("uppercase");
//   if (document.getElementById("lowercase").checked) selectedOptions.push("lowercase");
//   if (document.getElementById("numbers").checked) selectedOptions.push("numbers");
//   if (document.getElementById("symbols").checked) selectedOptions.push("symbols");

//   // If no options selected, show message
//   if (selectedOptions.length === 0) {
//     passwordOutput.textContent = "No character selected.";
//     if (typeof updateStrengthMeter === "function") updateStrengthMeter("");
//     return;
//   }

//   // Calculate character distribution
//   const distribution = distributeCharacters(length, selectedOptions);
  
//   // Generate password based on distribution
//   let password = "";
  
//   for (const [type, count] of Object.entries(distribution)) {
//     const pool = customSelections[type] || [];
//     if (pool.length > 0) {
//       for (let i = 0; i < count; i++) {
//         const cryptoObj = window.crypto || window.msCrypto;
//         const r = cryptoObj.getRandomValues(new Uint32Array(1))[0] % pool.length;
//         password += pool[r];
//       }
//     }
//   }
  
//   // Shuffle the password to mix character types
//   password = password.split('').sort(() => Math.random() - 0.5).join('');
  
//   applyCharacterColors(password);

//   // update strength meter if you have one
//   if (typeof updateStrengthMeter === "function") updateStrengthMeter(password);
// }

// // Update the gear icon functionality to handle distribution
// gearIcon.addEventListener('click', () => {
//   // Get selected options
//   const selectedOptions = [];
//   if (document.getElementById("uppercase").checked) selectedOptions.push("uppercase");
//   if (document.getElementById("lowercase").checked) selectedOptions.push("lowercase");
//   if (document.getElementById("numbers").checked) selectedOptions.push("numbers");
//   if (document.getElementById("symbols").checked) selectedOptions.push("symbols");
  
//   // Get current length
//   const length = parseInt(document.getElementById("length").value, 10) || 12;
  
//   // Calculate distribution
//   const distribution = distributeCharacters(length, selectedOptions);
  
//   // Update sliders based on distribution
//   if (selectedOptions.includes("uppercase")) {
//     document.getElementById("uppercaseSelect").value = distribution.uppercase || 0;
//   }
//   if (selectedOptions.includes("lowercase")) {
//     document.getElementById("lowercaseSelect").value = distribution.lowercase || 0;
//   }
//   if (selectedOptions.includes("numbers")) {
//     document.getElementById("numberSelect").value = distribution.numbers || 0;
//   }
//   if (selectedOptions.includes("symbols")) {
//     document.getElementById("symbolSelect").value = distribution.symbols || 0;
//   }
  
//   // Update display values
//   updateSliderValues();
  
//   // Show the modal
//   gearModal.style.display = 'flex';
// });

// // Update the saveGearBtn event listener to apply the distribution
// saveGearBtn.addEventListener("click", () => {
//   // Get the values from sliders
//   const uppercaseCount = parseInt(document.getElementById("uppercaseSelect").value, 10);
//   const lowercaseCount = parseInt(document.getElementById("lowercaseSelect").value, 10);
//   const numbersCount = parseInt(document.getElementById("numberSelect").value, 10);
//   const symbolsCount = parseInt(document.getElementById("symbolSelect").value, 10);
  
//   // Get selected options
//   const selectedOptions = [];
//   if (document.getElementById("uppercase").checked) selectedOptions.push("uppercase");
//   if (document.getElementById("lowercase").checked) selectedOptions.push("lowercase");
//   if (document.getElementById("numbers").checked) selectedOptions.push("numbers");
//   if (document.getElementById("symbols").checked) selectedOptions.push("symbols");
  
//   // Calculate total from sliders
//   const totalFromSliders = uppercaseCount + lowercaseCount + numbersCount + symbolsCount;
//   const length = parseInt(document.getElementById("length").value, 10) || 12;
  
//   // Validate that the sum matches the length
//   if (totalFromSliders !== length) {
//     alert(`The sum of character types (${totalFromSliders}) must equal the password length (${length}).`);
//     return;
//   }
  
//   // Hide the modal
//   gearModal.style.display = "none";
// });



// Add a variable to track custom distribution
let customDistribution = null;

// Function to calculate default distribution
function calculateDefaultDistribution(length, selectedOptions) {
  const distribution = {};
  const optionCount = selectedOptions.length;
  
  if (optionCount === 0) return {};
  
  // Calculate base distribution
  const baseCount = Math.floor(length / optionCount);
  let remainder = length % optionCount;
  
  // Initialize distribution
  selectedOptions.forEach(option => {
    distribution[option] = baseCount;
  });
  
  // Distribute remainder
  for (let i = 0; i < remainder; i++) {
    const option = selectedOptions[i % selectedOptions.length];
    distribution[option]++;
  }
  
  return distribution;
}


function countSelectedOptions() {
  let count = 0;
  if (document.getElementById("uppercase").checked) count++;
  if (document.getElementById("lowercase").checked) count++;
  if (document.getElementById("numbers").checked) count++;
  if (document.getElementById("symbols").checked) count++;
  return count;
}

// Function to update gear icon state
function updateGearIconState() {
  const gearIcon = document.getElementById("gearIcon");
  const selectedCount = countSelectedOptions();
  
  if (selectedCount <= 1) {
      gearIcon.classList.add("disabled");
      // Clear custom distribution when only one option is selected
      customDistribution = null;
  } else {
      gearIcon.classList.remove("disabled");
  }
}

// Update the gear icon click handler
gearIcon.addEventListener('click', () => {
  // Get selected options
  const selectedOptions = [];
  if (document.getElementById("uppercase").checked) selectedOptions.push("uppercase");
  if (document.getElementById("lowercase").checked) selectedOptions.push("lowercase");
  if (document.getElementById("numbers").checked) selectedOptions.push("numbers");
  if (document.getElementById("symbols").checked) selectedOptions.push("symbols");
  
  // Get current length
  const length = parseInt(document.getElementById("length").value, 10) || 12;
  
  // Calculate default distribution if no custom distribution exists
  const distribution = customDistribution || calculateDefaultDistribution(length, selectedOptions);
  
  // Update sliders based on distribution
  document.getElementById("uppercaseSelect").value = distribution.uppercase || 0;
  document.getElementById("lowercaseSelect").value = distribution.lowercase || 0;
  document.getElementById("numberSelect").value = distribution.numbers || 0;
  document.getElementById("symbolSelect").value = distribution.symbols || 0;
  
  // Update display values
  updateSliderValues();
  
  // Show the modal
  gearModal.style.display = 'flex';
});

// Update the saveGearBtn event listener
saveGearBtn.addEventListener("click", () => {
  // Get the values from sliders
  const uppercaseCount = parseInt(document.getElementById("uppercaseSelect").value, 10);
  const lowercaseCount = parseInt(document.getElementById("lowercaseSelect").value, 10);
  const numbersCount = parseInt(document.getElementById("numberSelect").value, 10);
  const symbolsCount = parseInt(document.getElementById("symbolSelect").value, 10);
  
  // Calculate total from sliders
  const totalFromSliders = uppercaseCount + lowercaseCount + numbersCount + symbolsCount;
  const length = parseInt(document.getElementById("length").value, 10) || 12;
  
  // Validate that the sum matches the length
  if (totalFromSliders !== length) {
    alert(`The sum of character types (${totalFromSliders}) must equal the password length (${length}).`);
    return;
  }
  
  // Store the custom distribution (but don't save to localStorage)
  customDistribution = {
    uppercase: uppercaseCount,
    lowercase: lowercaseCount,
    numbers: numbersCount,
    symbols: symbolsCount
  };
  
  // Hide the modal
  gearModal.style.display = "none";
});

// Update the defaultBtn event listener to clear custom distribution
defaultBtn.addEventListener("click", () => {
  // Clear custom distribution
  customDistribution = null;
  
  // Reset to default character sets
  customSelections.uppercase = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
  customSelections.lowercase = [..."abcdefghijklmnopqrstuvwxyz"];
  customSelections.numbers = [..."0123456789"];
  customSelections.symbols = [..."!@#$%^&*()_+-=[]{}|;:'\",.<>/?`~"];

  // Get selected options
  const selectedOptions = [];
  if (document.getElementById("uppercase").checked) selectedOptions.push("uppercase");
  if (document.getElementById("lowercase").checked) selectedOptions.push("lowercase");
  if (document.getElementById("numbers").checked) selectedOptions.push("numbers");
  if (document.getElementById("symbols").checked) selectedOptions.push("symbols");
  
  // Get current length
  const length = parseInt(document.getElementById("length").value, 10) || 12;
  
  // Calculate default distribution
  const distribution = calculateDefaultDistribution(length, selectedOptions);
  
  // Update sliders based on default distribution
  document.getElementById("uppercaseSelect").value = distribution.uppercase || 0;
  document.getElementById("lowercaseSelect").value = distribution.lowercase || 0;
  document.getElementById("numberSelect").value = distribution.numbers || 0;
  document.getElementById("symbolSelect").value = distribution.symbols || 0;
  
  // Update display values
  updateSliderValues();
  
  alert("Reset to Default ⚙️");
});

// Update the generatePasswordButton function to use either custom or default distribution
function generatePasswordButton() {
  const lengthInput = document.getElementById("length");
  const passwordOutput = document.getElementById("password");

  const length = parseInt(lengthInput.value, 10) || 12;

  // Get selected options
  const selectedOptions = [];
  if (document.getElementById("uppercase").checked) selectedOptions.push("uppercase");
  if (document.getElementById("lowercase").checked) selectedOptions.push("lowercase");
  if (document.getElementById("numbers").checked) selectedOptions.push("numbers");
  if (document.getElementById("symbols").checked) selectedOptions.push("symbols");

  // If no options selected, show message
  if (selectedOptions.length === 0) {
    passwordOutput.textContent = "No character selected.";
    if (typeof updateStrengthMeter === "function") updateStrengthMeter("");
    return;
  }

  // Use custom distribution if available, otherwise calculate default
  // const distribution = customDistribution || calculateDefaultDistribution(length, selectedOptions);
  const distribution = (customDistribution && selectedOptions.length > 1) 
    ? customDistribution 
    : calculateDefaultDistribution(length, selectedOptions);
  
  // Generate password based on distribution
  let password = "";
  
  for (const [type, count] of Object.entries(distribution)) {
    const pool = customSelections[type] || [];
    if (pool.length > 0 && count > 0) {
      for (let i = 0; i < count; i++) {
        const cryptoObj = window.crypto || window.msCrypto;
        const r = cryptoObj.getRandomValues(new Uint32Array(1))[0] % pool.length;
        password += pool[r];
      }
    }
  }
  
  // If we couldn't generate enough characters (due to empty pools), fall back to default
  if (password.length < length) {
    const fallbackDistribution = calculateDefaultDistribution(length, selectedOptions);
    password = "";
    
    for (const [type, count] of Object.entries(fallbackDistribution)) {
      const pool = customSelections[type] || charSets[type] || [];
      if (pool.length > 0 && count > 0) {
        for (let i = 0; i < count; i++) {
          const cryptoObj = window.crypto || window.msCrypto;
          const r = cryptoObj.getRandomValues(new Uint32Array(1))[0] % pool.length;
          password += pool[r];
        }
      }
    }
  }
  
  // Shuffle the password to mix character types
  password = password.split('').sort(() => Math.random() - 0.5).join('');
  
  applyCharacterColors(password);

  // update strength meter
  if (typeof updateStrengthMeter === "function") updateStrengthMeter(password);
}

// Update the updateSliderValues function to enable/disable save button based on length match
function updateSliderValues() {
  let total = 0;

  sliders.forEach(slider => {
    let valueSpanId = slider.id.replace("Select", "") + "Value"; 
    const valueSpan = document.getElementById(valueSpanId);
    if (valueSpan) {
      valueSpan.textContent = slider.value;
    }
    total += parseInt(slider.value, 10);
  });

  const length = parseInt(document.getElementById("length").value, 10) || 12;
  
  if (totalValueDisplay) {
    totalValueDisplay.textContent = `${total} / ${length}`;
  }

  // Enable save button only if total matches length
  if (total === length) {
    saveGearBtn.disabled = false;
    saveGearBtn.classList.remove('disabled');
  } else {
    saveGearBtn.disabled = true;
    saveGearBtn.classList.add('disabled');
  }
}

// Clear custom distribution on page load
document.addEventListener('DOMContentLoaded', function() {
  customDistribution = null;
});


//////////////////// need to fix a small bug here ////////////////////
// wish!!!
