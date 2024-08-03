document.getElementById('signUp').addEventListener('click', () => {
  document.querySelector('.container').classList.add('right-panel-active');
});

document.getElementById('signIn').addEventListener('click', () => {
  document.querySelector('.container').classList.remove('right-panel-active');
});

document.getElementById('resetPassword').addEventListener('click', () => {
  window.location.href = '/step1'; // Redirect to the forgot password page
});

document.getElementById('signUpForm').addEventListener('submit', function(event) {
  const email = this.email.value;
  const password = this.password.value;
  const confirmPassword = this.confirm_password.value;
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!emailPattern.test(email)) {
      alert('Please enter a valid email address.');
      event.preventDefault();
  } else if (!passwordPattern.test(password)) {
      alert('Password must be at least 8 characters long and contain at least one letter, one number, and one special character.');
      event.preventDefault();
  } else if (password !== confirmPassword) {
      alert('Passwords do not match.');
      event.preventDefault();
  }
});

document.getElementById('signInForm').addEventListener('submit', function(event) {
  const email = this.email.value;
  const password = this.password.value;
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailPattern.test(email)) {
      alert('Please enter a valid email address.');
      event.preventDefault();
  } else if (password.length < 8) {
      alert('Password must be at least 8 characters long.');
      event.preventDefault();
  }
});
