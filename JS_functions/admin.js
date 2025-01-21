document.addEventListener('DOMContentLoaded', () => {
    // Handle Add Product
    document.getElementById('addForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const table = document.getElementById('addTable').value;
        const CodProdus = document.getElementById('addCodProdus').value;
        const Denumire = document.getElementById('addDenumire').value;
        const Pret = document.getElementById('addPrice').value;
        const Material = document.getElementById('addMaterial').value;
        const Finisaj = document.getElementById('addFinish').value;

        try {
            const response = await fetch('/api/admin/addProduct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ table, CodProdus, Denumire, Pret, Material, Finisaj }),
            });
            const result = await response.json();
            alert(result.message || 'Product added successfully!');
        } catch (error) {
            console.error('Error adding product:', error);
            alert('Failed to add product. Check the console for details.');
        }
    });

    // Handle Search Product
    document.getElementById('searchForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const table = document.getElementById('searchTable').value;
        const CodProdus = document.getElementById('searchCodProdus').value;

        try {
            const response = await fetch('/api/admin/searchProduct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ table, CodProdus }),
            });
            const result = await response.json();
            const output = document.getElementById('searchResult');
            if (result.success) {
                output.innerHTML = `<pre>${JSON.stringify(result.product, null, 2)}</pre>`;
            } else {
                output.innerText = result.message || 'Product not found.';
            }
        } catch (error) {
            console.error('Error searching for product:', error);
            alert('Failed to search product. Check the console for details.');
        }
    });

    // Handle Update Product
    document.getElementById('modifyForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const table = document.getElementById('modifyTable').value;
        const CodProdus = document.getElementById('modifyCodProdus').value;
        const Pret = document.getElementById('modifyNewPrice').value;
        const Material = document.getElementById('modifyMaterial').value;
        const Finisaj = document.getElementById('modifyFinish').value;

        try {
            const response = await fetch('/api/admin/updateProduct', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ table, CodProdus, Pret, Material, Finisaj }),
            });
            const result = await response.json();
            alert(result.message || 'Product updated successfully!');
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Failed to update product. Check the console for details.');
        }
    });

    // Handle Delete Product
    document.getElementById('deleteForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const table = document.getElementById('deleteTable').value;
        const CodProdus = document.getElementById('deleteCodProdus').value;

        try {
            const response = await fetch('/api/admin/deleteProduct', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ table, CodProdus }),
            });
            const result = await response.json();
            alert(result.message || 'Product deleted successfully!');
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product. Check the console for details.');
        }
    });
});
