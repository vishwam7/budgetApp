//BUDGET CONTROLLER
var budgetController = (function() {
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            //[1,2,3,4], nextID =5
            //[1,4,6,7], nextID = 8
            //ID = lastID +1

            //create new ID
            if (data.allItems[type].length > 0)
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            else
                ID = 0;

            //create new item based on 'exp' or 'inc'
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //push it into our dataStructure
            data.allItems[type].push(newItem);

            //return the new element
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;
            //id=6
            //data.allItems[type][id]
            //ids = [1 2 4 6 8] 3?
            //index=3

            ids = data.allItems[type].map(function(current) {
                return current.id;
            }); //map always returns brand new array where forEach doesn't
            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function() {
            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //calculate the budget: income- expenses
            data.budget = data.totals.inc - data.totals.exp;

            //calculate the percentage that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        testing: function() {
            return console.log(data);
        }
    };
})();

//UI CONTROLLER
var UIController = (function() {
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container'
    }
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMStrings.inputType).value, // it'll be either inc or exp
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },
        addListItem: function(obj, type) {
            // create HTML string with placeholder text
            var html, newHtml, element;
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percentage%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            // Replace the placeholder text with actual value
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);
            newHtml = newHtml.replace('%percentage%', obj.percentage);
            //Insert the HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },
        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        clearFields: function() {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

            var fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();
        },
        displayBudget: function(obj) {
            document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;

            document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc;

            document.querySelector(DOMStrings.expensesLabel).textContent = obj.totalExp;
            if (obj.percentage > 0)
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            else
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';

        },
        getDOMStrings: function() {
            return DOMStrings;
        }
    };
})();

//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    };
    var updateBudget = function() {
        //1.calculate budget
        budgetCtrl.calculateBudget();
        //2.return the budget
        var budget = budgetCtrl.getBudget();
        //3.display the budget on the ui
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function() {
        //1.calculate percentages
        //2.read percentages from the budget controller
        //3.update the UI with the new percentages
    }

    var ctrlAddItem = function() {
        var input, newItem;
        // 1. get the field input data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //2.add item to budgetController
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            //3.add the items to ui
            UICtrl.addListItem(newItem, input.type);
            //4.clear fields
            UIController.clearFields();
            //5.calculate and update budget
            updateBudget();
            //6.calculate and update the percentages
            updatePercentages();
        }

    };

    var ctrlDeleteItem = function(event) {
        var itemId, splitId, type, ID;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemId) {
            //inc-1
            splitId = itemId.split('-');
            type = splitId[0];
            ID = parseInt(splitId[1]);

            //1.delete item from data structure
            budgetCtrl.deleteItem(type, ID);
            //2.delete an item from user interface
            UICtrl.deleteListItem(itemId);
            //3.update and show the new budget
            updateBudget();
            //4.calculate and update the percentages
            updatePercentages();
        }
    };

    return {
        init: function() {
            console.log('Application has started!');
            setupEventListeners();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
        }
    };

})(budgetController, UIController);

controller.init();