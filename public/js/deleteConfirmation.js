document.addEventListener("DOMContentLoaded", function() {
  const table = document.querySelector(".classification-table");
  const modal = document.getElementById("deleteModal");
  const cancelBtn = document.getElementById("cancelDelete");
  const confirmBtn = document.getElementById("confirmDelete");
  let currentId = null;

  if (table) {
    table.addEventListener("click", function(event) {
      const deleteButton = event.target.closest(".delete-btn");
      if (!deleteButton) return;

      currentId = deleteButton.dataset.classification;
      modal.style.display = "flex";
    });
  }

  cancelBtn.addEventListener("click", function() {
    modal.style.display = "none";
    currentId = null;
  });

  confirmBtn.addEventListener("click", function() {
    if (!currentId) return;

    fetch(`/inv/delete/${currentId}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } })
      .then(response => {
        if (!response.ok) return response.json().then(err => { throw new Error(err.message || 'Failed to delete the classification.'); });
        return response.json();
      })
      .then(data => {
        alert(data.message || "Classification successfully deleted!");
        window.location.href = "/inv/";
      })
      .catch(error => {
        console.error('Error in DELETE request:', error);
        alert("ERROR: Could not delete the classification. Details: " + error.message);
      });

    modal.style.display = "none";
    currentId = null;
  });
});
