import mongoClient from '../utils/db.js'
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

async function checkAccountFunc(collection, email) {
    return await collection.find({ email: email }).toArray();
}

async function addAccountFunc(collection, account) {
    const id = await collection.insertOne(account);
    return id.insertedId;
}

async function verifyAccountFunc(collection, id) {
    await collection.updateOne({_id: new ObjectId(id)}, {$set: {verified: true}});
}

async function loginAccountFunc(collection, user, pass) {
    const result = await collection.find(user).toArray();
    if (await bcrypt.compare(pass, result[0].pass))
        return result;
    return [];
}

export default {
    async checkAccount(email) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('onlineauction');
            const collection = db.collection('account');
            return await checkAccountFunc(collection, email);
        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close()
        }
    },
    async addAccount(account) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('onlineauction');
            const collection = db.collection('account');
            return await addAccountFunc(collection, account);
        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close()
        }
    },
    async verifyAccount(id) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('onlineauction');
            const collection = db.collection('account');
            await verifyAccountFunc(collection, id);
        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close()
        }
    },
    async loginAccount(user, pass) {
        try {
            await mongoClient.connect();
            const db = mongoClient.db('onlineauction');
            const collection = db.collection('account');
            return await loginAccountFunc(collection, user, pass);
        } catch (e) {
            console.error(e);
        } finally {
            await mongoClient.close()
        }
    }
};