import modelProduct from '../models/product-model.js'

export default {
    async handlePage(prevPage, curPage, nextPage, choosenPage, nPage) {
        //Get total
        console.log("Number Page : " + nPage);

        if (choosenPage === undefined){
            prevPage.check = false;
            curPage.value = 1;
            if (nPage > 1)
                nextPage.value = 2;
            else
                nextPage.check = false;
        }
        else{
            if (+choosenPage === 1)
                prevPage.check = false;
            else
                prevPage.value = +choosenPage - 1;

            curPage.value = +choosenPage

            if (+choosenPage >= nPage)
                nextPage.check = false;
            else
                nextPage.value = +choosenPage + 1;
        }


    },

};