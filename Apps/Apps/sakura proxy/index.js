if (!localStorage.getItem('panicKey')) {
  localStorage.setItem('panicKey', 'g');
}
if (!localStorage.getItem('panicURL')) {
  localStorage.setItem('panicURL', 'https://google.com');
}

document.addEventListener('keydown', function(event) {
  const panicKey = localStorage.getItem('panicKey') || 'g';
  const panicURL = localStorage.getItem('panicURL') || 'https://google.com';
  if (event.key === panicKey) {
    window.location.href = panicURL;
  }
});

document.querySelectorAll('.sidebar a').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const targetPage = this.getAttribute('data-src');
    const iframe = document.getElementById('main-frame');

    if (targetPage) {
      iframe.classList.add('fade-out');
      iframe.addEventListener('transitionend', function handleTransition() {
        iframe.removeEventListener('transitionend', handleTransition);
        iframe.src = targetPage;
        iframe.classList.remove('fade-out');
        iframe.classList.add('fade-in');
        setTimeout(() => {
          iframe.classList.remove('fade-in');
        }, 300); 
      });
    }
  });
});

function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  document.getElementById('clock').textContent = `${hours}:${minutes} ${ampm}`;

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[now.getMonth()];
  const day = now.getDate();
  document.getElementById('date').textContent = `${month} ${day}`;
}
setInterval(updateClock, 1000);
updateClock();

navigator.getBattery?.().then(battery => {
  function updateBattery() {
    const level = Math.round(battery.level * 100);
    document.getElementById('battery').textContent = `Battery: ${level}%`;
    const icon = document.getElementById('battery-icon');
    icon.className = 'fa-solid';
    if (level >= 80) {
      icon.classList.add('fa-battery-full');
    } else if (level >= 60) {
      icon.classList.add('fa-battery-three-quarters');
    } else if (level >= 40) {
      icon.classList.add('fa-battery-half');
    } else if (level >= 20) {
      icon.classList.add('fa-battery-quarter');
    } else {
      icon.classList.add('fa-battery-empty');
    }
  }

  updateBattery();
  battery.addEventListener('levelchange', updateBattery);
});
