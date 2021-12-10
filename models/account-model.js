const list = [
    {productID: 0, name: 'bàn gỗ 1fffffffffffffffffffffffff'},
    {productID: 1, name: 'bàn gỗ 2'},
    {productID: 2, name: 'bàn gỗ 3'},
    {productID: 3, name: 'bàn gỗ 4'},
];



export default {
    findAll(){
        return list;
    },

    findByID(id){
        return list[id];
    },

    deleteFavoriteItem(id){
        var newPeople = [];
        list.forEach(function(p){
            if(p.productID !== id){
                newPeople.push(p);
            }
        });
        return newPeople;
    }

}


