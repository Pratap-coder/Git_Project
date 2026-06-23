<!-- Add onsubmit="disableSubmit()" to your form -->
<form action="%%=CloudPagesURL(123)=%%" method="POST" id="myForm" onsubmit="disableSubmit()">
    
    <!-- Your Form Fields -->
    <label for="EmailAddress">Email</label>
    <input type="email" name="EmailAddress" id="EmailAddress" required>

    <!-- Hidden field for AMPScript submission checking (See Pro-Tip below) -->
    <input type="hidden" name="formSubmitted" value="true">

    <!-- Submit Button -->
    <button type="submit" id="submitBtn">Submit</button>

</form>

<script>
    function disableSubmit() {
        var btn = document.getElementById("submitBtn");
        
        // Disable the button
        btn.disabled = true;
        
        // Optional: Change the button text to give the user visual feedback
        btn.innerHTML = "en cours de traitement..."; 
        
        // Add a slight CSS style change (optional)
        btn.style.opacity = "0.6";
        btn.style.cursor = "not-allowed";

        return true; // Allow the form to continue submitting
    }
</script>