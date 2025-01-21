// Buttons: Log in / Sign Up
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');

// Modal Content
const modalContainer = document.getElementById('modal');
const modalText = document.getElementById('modal-text');
const modalElements = document.getElementById('modal-elements');
const closeBtn = document.querySelector('.close-btn');
const overlay = document.querySelector(".overlay");

// Function to create the HTML for Login Form and Forgot Password
const loginFormHtml = () => {
  return `
      <form id="login-form">
          <label for="email"></label>
          <input type="email" id="email" placeholder='Email' aria-label="Email" required>
          <div class="password-container">
            <label for="password"></label>
            <input type="password" id="password" placeholder='Password' aria-label="Password" required>
            <img src="eye.png" id="eye" class="eye-icon" alt="View Password">
          </div>
          <button type="submit" aria-label="Submit Log In Button">Log In</button>
          <p class='message'></p>
          <p><a href="#" id="forgot-password" class="form-link" aria-label="Forgot password">Forgot Password</a></p>
      </form>

      <form id="forgot-password-form" style="display: none;">
          <label for="email-recover">Enter your email</label>
          <input type="email" id="email-recover" placeholder="user@yahoo.com" required>
          <button type="submit" aria-label="Submit Reset Password">Submit</button>
          <p class='message' aria-live="polite"></p>
          <p id="reset-confirmation" class="message" style="display: none;">
              If this email is associated with an account, a reset link will be sent. Please check your inbox or spam.
          </p>
          <button><a href="#" id="back-login" class="backToLogin">Login</a></button>
      </form>
  `;
}

// Function to create the HTML for Signup Form
const signupFormHtml = () => {
  return `
      <form id="signup-form">
          <label for="firstName"></label>
          <input type="text" id="firstName" placeholder="First Name" aria-label="First Name" required>
          <label for="lastName"></label>
          <input type="text" id="lastName" placeholder='Last Name' aria-label="Last Name" required>
          <label for="newEmail"></label>
          <input type="email" id="newEmail" placeholder='Email' aria-label="Email" required>
          <div class="password-container">
            <label for="newPassword"></label>
            <input type="password" id="newPassword" placeholder='Password' aria-label="Password" required>
            <img src="eye.png" id="eye" class="eye-icon2" alt="View Password">
          </div>
          <button type="submit" aria-label="Submit Sign Up Button">Sign Up</button>
          <p class='message' aria-live="polite"></p>
      </form>
  `;
}

// Login button functionality
loginBtn.addEventListener('click', () => {
  modalText.textContent = 'Log In';
  modalElements.innerHTML = loginFormHtml();
  
  const loginForm = document.getElementById('login-form');
  const forgotPasswordLink = document.getElementById('forgot-password');
  const forgotPassForm = document.getElementById("forgot-password-form");
  const confirmReset = document.getElementById("reset-confirmation");
  const backBtn = document.getElementById("back-login");

  // Event listeners specific to login form actions: SUBMIT and Forgot Password
  loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleLogin();  // function handleLogin() for login logic 
  });

  forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      loginForm.style.display = 'none';
      forgotPassForm.style.display = 'block';
      modalText.textContent = 'Reset Password';
  });

  forgotPassForm.addEventListener('submit', (e) => {
      e.preventDefault();
      confirmReset.style.display = 'block';
  });

  backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      forgotPassForm.style.display = 'none';
      loginForm.style.display = 'block';
      confirmReset.style.display = 'none';
      modalText.textContent = 'Log In';
  });

  open();
  togglePassword(); 
});

// Signup button functionality
signupBtn.addEventListener('click', () => {
  modalText.textContent = "Sign Up";
  modalElements.innerHTML = signupFormHtml();  
  
  const signupForm = document.getElementById('signup-form');

  // Event listeners specific to signup form actions
  signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSignup();  // function handleSignup() for signup logic 
  });

  open();
  togglePassword();
});

const open = () => {
  modalContainer.classList.remove('hidden');
  overlay.classList.remove("hidden");
};

const close = () => {
  modalContainer.classList.add("hidden");
  overlay.classList.add("hidden");
};

// Handle the login action
const handleLogin = () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const message = document.querySelector('#login-form .message');

  if (!regexValidation({email,  password,  message})) {
      return;  // Stop if validation fails
  }

  // try-catch prevent the app from crashing if storage access fails.
  try{
    const existentUsers = JSON.parse(localStorage.getItem('allUsers')) || [];
    const user = existentUsers.find(user => user.email === email && user.password === password);

    if (user) {
      message.textContent = 'Successfully logged in!';
      message.style.color = "green";
      document.getElementById('login-form').reset();
      setTimeout(() => {
          window.location.href = 'indexapp.html';
      }, 1000);

    } else {
      message.textContent = 'Incorrect email or password.';
      message.style.color = "red";
    }
  } catch (err) {
      message.textContent = 'An error occurred while logging in. Please try again.';
      message.style.color = "red";
      console.error("Error accessing localStorage:", err);
  }
}

// Handle the signup action
const handleSignup = () => {
  const newEmail = document.getElementById('newEmail').value;
  const newPassword = document.getElementById('newPassword').value;
  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const message = document.querySelector('#signup-form .message');

  if (!regexValidation({newEmail, newPassword, message})) {
      return;  // Stop if validation fails
  }
  
  try {
    const storedUsers = JSON.parse(localStorage.getItem('allUsers')) || [];
    const registeredUser = storedUsers.find(user => user.email === newEmail);

    if (registeredUser) {
        message.textContent = 'Expense Tracker account already exists.';
        message.style.color = "blue";
    } else {
        const newUser = {firstName, lastName, email: newEmail, password: newPassword};
        storedUsers.push(newUser);
        localStorage.setItem('allUsers', JSON.stringify(storedUsers));
        message.textContent = 'Successfully signed up! Welcome!';
        message.style.color = "green";
        document.getElementById('signup-form').reset(); 
        setTimeout(() => {
          window.location.href = 'indexapp.html'; 
      }, 1000);
    }
  } catch (err) {
    message.textContent = 'An error occurred while signing up. Please try again.'
    message.style.color = "red";
    console.error("Error accessing localStorage:", err);
  }
  
}

// Regex Validation
const regexValidation = ({email, newEmail, password, newPassword, message}) => {
  const emailRegexVal = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegexVal = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&.,])[A-Za-z\d@$!%*#?&.,]{8,}$/;
  
  if ((email && !emailRegexVal.test(email)) || (newEmail && !emailRegexVal.test(newEmail))) {
  message.textContent = "Invalid email format.";
  message.style.color = "red";
  return false; // Indicate failure
  }
  
  if ((password && !passwordRegexVal.test(password)) || (newPassword && !passwordRegexVal.test(newPassword))) {
  message.textContent = "Password must be at least 8 characters include one letter, one number, and one special character.";
  message.style.color = "red";
  return false; // Indicate failure
  }
  
  return true;
  
  }

// Show or Hide the password
const togglePassword = () => {
  const passwordInput = document.getElementById('password'); 
  const newPassInput = document.getElementById('newPassword'); 
  const eyeIcon = document.getElementById('eye'); 
  if (eyeIcon) {
    eyeIcon.addEventListener('click', () => {
    
      if (passwordInput) {
        const inputTypeLogin = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', inputTypeLogin);
      }

      if (newPassInput) {
        const inputTypeSignup = newPassInput.getAttribute('type') === 'password' ? 'text' : 'password';
        newPassInput.setAttribute('type', inputTypeSignup);
      }
    });
  }
};

closeBtn.addEventListener('click', close);
overlay.addEventListener("click", close);
