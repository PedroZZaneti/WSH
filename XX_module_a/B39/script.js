document.addEventListener('DOMContentLoaded', function() {
    const addCounterBtn = document.getElementById('addCounterBtn');
    const countersContainer = document.getElementById('countersContainer');
    let counterId = 0;

    // Function to create a new counter
    function createCounter(initialValue = 0) {
        counterId++;
        
        const counter = document.createElement('div');
        counter.className = 'counter';
        counter.dataset.id = counterId;
        
        const valueDisplay = document.createElement('div');
        valueDisplay.className = 'counter-value';
        valueDisplay.textContent = initialValue;
        
        const controls = document.createElement('div');
        controls.className = 'counter-controls';
        
        const decreaseBtn = document.createElement('button');
        decreaseBtn.className = 'btn decrease-btn';
        decreaseBtn.textContent = 'Decrease';
        
        const increaseBtn = document.createElement('button');
        increaseBtn.className = 'btn increase-btn';
        increaseBtn.textContent = 'Increase';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn delete-btn';
        deleteBtn.textContent = 'Delete';
        
        // Event listeners for buttons
        decreaseBtn.addEventListener('click', function() {
            let currentValue = parseInt(valueDisplay.textContent);
            valueDisplay.textContent = currentValue - 1;
        });
        
        increaseBtn.addEventListener('click', function() {
            let currentValue = parseInt(valueDisplay.textContent);
            valueDisplay.textContent = currentValue + 1;
        });
        
        deleteBtn.addEventListener('click', function() {
            countersContainer.removeChild(counter);
        });
        
        // Append elements
        controls.appendChild(decreaseBtn);
        controls.appendChild(increaseBtn);
        controls.appendChild(deleteBtn);
        
        counter.appendChild(valueDisplay);
        counter.appendChild(controls);
        
        return counter;
    }

    // Add counter button click handler
    addCounterBtn.addEventListener('click', function() {
        const newCounter = createCounter();
        countersContainer.appendChild(newCounter);
    });

   
});