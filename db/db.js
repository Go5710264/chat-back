const subscription = {
    data: [],
    listeners: [], // массив слушателей события

    add(item){
        this.data.push(item);

        this.listeners.forEach(handler => handler(item))

        console.log(this.data, this.listeners)
    },

    listen(handler){
        this.listeners.push(handler)
    }
}

module.exports = subscription; // необоходимо везде заменить логику, где упоминается subscription 