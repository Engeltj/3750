// localStorage wrapper 
var DB = {
    // Reads a value given the key from localStorage, can also be sessionStorage
    read: function(key, type){
        var storage = type === 'session' ? sessionStorage : localStorage,
            data    = storage.getItem(key);

        try{
            return JSON.parse(data);
        } catch(e) {
            return data;
        }
    },
    // Write a key value pair to localStorage, can also be sessionStorage
    write: function(key, value, type) {
        var storage = type === 'session' ? sessionStorage : localStorage;

        if(typeof(value) == 'Array' || typeof(value) == 'object') {
            value = JSON.stringify(value);
        }

        try {
            storage.setItem(key, value);
        } catch (e) {
            alert("Uh Oh! Please turn off private browsing and try again.");
        }
    },
    // Removes a key value pair from localStorage, can also be sessionStorage
    remove: function(key, type) {
        var storage = type === 'session' ? sessionStorage : localStorage;
        storage.removeItem(key);
    },
    // Clears session and localStorage
    clear: function() {
        sessionStorage.clear();
        localStorage.clear();
    },
};
