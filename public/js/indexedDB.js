let db,
    transaction,
    store;
const request = indexedDB.open("offlineBudget", 1);

request.onupgradeneeded = function (e) {
    db = event.target.result;
    db.createObjectStore("cache", { autoIncrement: true });
};


request.onsuccess = function (e) {
    db = event.target.result;
    if (navigator.online) {
        dataBaseCheck();
    }
};

function saveRecord(data) {
    transaction = db.transaction(["cache"], "readwrite");
    store = transaction.objectStore("cache")
    store.add(data)
};

function dataBaseCheck() {
    transaction = db.transaction(["cache"], "readwrite");
    store = transaction.objectStore("cache");
    const getAll = store.getAll();
    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*", "Content-Type": "application/json"
                }
            })
                .then(() => {
                    transaction = db.transaction(["cache"], "readwrite");
                    store = transaction.objectStore("cache");
                    store.clear();
                })
        }
    }
};

request.onerror = function (e) {
    console.log("There was an error");
};

window.addEventListener("online", dataBaseCheck);