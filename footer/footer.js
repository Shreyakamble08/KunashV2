fetch("/footer/footer.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("footer").innerHTML = data;
    document.getElementById("year").textContent = new Date().getFullYear();
  });
