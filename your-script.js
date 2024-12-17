function generatePassword(
  length,
  includeUppercase,
  includeLowercase,
  includeNumbers,
  includeSymbols
) {
  const characters = [];

  if (includeUppercase) {
    characters.push(..."ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  }
  if (includeLowercase) {
    characters.push(..."abcdefghijklmnopqrstuvwxyz");
  }
  if (includeNumbers) {
    characters.push(..."0123456789");
  }
  if (includeSymbols) {
    characters.push(..."!@#$%^&*()_+/~`");
  }

  if (characters.length === 0) {

    copyButton.addEventListener("click", () => {
        alert.classList.add("hide");
    });    
   
    return "No character selected.";
  } else{

    copyButton.addEventListener("click", () => {
        alert.classList.remove("hide");
        alert.classList.add("show");
        setTimeout(() => {
          alert.classList.add("hide");
        }, 3000);
      });
  };

  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters[randomIndex];
  }

  return password;
}

function generatePasswordButton() {
  const lengthInput = document.getElementById("length");
  const uppercaseCheckbox = document.getElementById("uppercase");
  const lowercaseCheckbox = document.getElementById("lowercase");
  const numbersCheckbox = document.getElementById("numbers");
  const symbolsCheckbox = document.getElementById("symbols");
  const passwordOutput = document.getElementById("password");
 

  const length = parseInt(lengthInput.value);
  const includeUppercase = uppercaseCheckbox.checked;
  const includeLowercase = lowercaseCheckbox.checked;
  const includeNumbers = numbersCheckbox.checked;
  const includeSymbols = symbolsCheckbox.checked;

  const password = generatePassword(
    length,
    includeUppercase,
    includeLowercase,
    includeNumbers,
    includeSymbols
  );
  passwordOutput.textContent = password;
}

function copyPassword() {
  const passwordOutput = document.getElementById("password");
  const passwordText = passwordOutput.textContent;

  if (passwordText) {
    navigator.clipboard
      .writeText(passwordText)
      .then(() => {
        alert("Password copied to clipboard!");
      })
      .catch(() => {
        alert("Failed to copy password.");
      });
  }
}


// Add event listener to the generate password button
const generateButton = document.getElementById("generate");
generateButton.addEventListener("click", generatePasswordButton);

// Add event listener to the copy button
const copyButton = document.getElementById("copy");
copyButton.addEventListener("click", copyPassword);

// extra works

const alert = document.querySelector(".alert");

// copyButton.addEventListener("click", () => {
//   alert.classList.remove("hide");
//   alert.classList.add("show");
//   setTimeout(() => {
//     alert.classList.add("hide");
//   }, 3000);
// });
