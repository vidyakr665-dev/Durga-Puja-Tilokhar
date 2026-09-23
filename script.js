const links = document.querySelectorAll('nav a');
links.forEach(link => {
  link.addEventListener('click', () => {
    document.querySelectorAll('nav a').forEach(x => x.classList.remove('active'));
    link.classList.add('active');
  });
});
