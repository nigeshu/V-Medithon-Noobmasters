document.addEventListener('DOMContentLoaded', function () {
  // Handle public idea submissions (store locally for demo)
  const form = document.getElementById('ideaForm');
  if (form) {
    const msg = document.getElementById('ideaMsg');
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const idea = {
        title: document.getElementById('pTitle').value.trim(),
        desc: document.getElementById('pDesc').value.trim(),
        reco: document.getElementById('pReco').value.trim(),
        name: document.getElementById('pName').value.trim(),
        email: document.getElementById('pEmail').value.trim(),
        ts: new Date().toISOString(),
      };
      const key = 'public_solutions';
      const arr = JSON.parse(localStorage.getItem(key) || '[]');
      arr.unshift(idea);
      localStorage.setItem(key, JSON.stringify(arr));
      msg.textContent = 'Thanks! Your idea was submitted.';
      form.reset();
      setTimeout(()=> msg.textContent = '', 3000);
    });
  }
});


