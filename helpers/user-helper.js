import { resolve } from "path";
import db from "../database/data.js";
import { rejects } from "assert";
import { allowedNodeEnvironmentFlags } from "process";

const userHelper = {
    addUser: (details) => {
        const { name, phoneNumber, email } = details;
        return new Promise(async (resolve, reject) => {
            try {
                const query = `insert into users (userName,phoneNumber,email) values ($1,$2,$3)`;
                const values = [name, phoneNumber, email];
                await db.query(query, values);
                resolve(true);
            } catch (e) {
                console.log('error occured in user adding ' + e);
                reject(e);
            }
        })
    },
    isUser: (detail) => {
        const { email } = detail;
        return new Promise(async (resolve, reject) => {
            try {
                const query = `select email from users where email=$1`;
                const values = [email];
                const result = await db.query(query, values);
                if (result.rows.length > 0) {
                    resolve(true);

                } else {
                    resolve(false);
                    console.log('cannod find email in the database');
                }
            } catch (e) {
                reject(e);
                console.log('something went wrong is checking user email');

            }
        })
    },

    getHotel: () => {
        return new Promise(async (resolve, reject) => {
            let hotels = [];
            try {
                const query = `SELECT * FROM hoteldetails`;
                const product = await db.query(query);
                const result = product.rows;
                result.forEach(element => {
                    hotels.push({ photo: element.hotelphoto, name: element.hotelname, location:element.locations, description: element.description, price: element.price, id: element.id });
                });
                resolve(hotels);
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    },
    getSpecifcdetails: (id) => {
        return new Promise(async (resolve, reject) => {
            const query = `SELECT id, hotelname, hotelphoto, price FROM hoteldetails WHERE id = $1`;
            const values = [id];
            try {
                const result = await db.query(query, values);
                const hotel = result.rows.map(element => ({
                    id: element.id,
                    photo: element.hotelphoto,
                    name: element.hotelname,
                    price: element.price
                }));
                //console.log(hotel);
                resolve(hotel);
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    },
    orderDetails: (details) => {
        let order = [];
        const { hotelId, hotelName, hotelPrice, firstName, lastName, email, phoneNumber, checkInDate, checkOutDate, roomType, numGuests, cardName, cardNumber } = details;
        return new Promise(async (resolve, reject) => {
            const query = `INSERT INTO bookingdetails (
                hotel_id,
                hotel_name,
                first_name,
                last_name,
                email,
                phone_number,
                check_in_date,
                check_out_date,
                room_type,
                num_guests,
                card_name,
                card_number,
              
                price
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`;
            const values = [hotelId, hotelName, firstName, lastName, email, phoneNumber, checkInDate, checkOutDate, roomType, numGuests, cardName, cardNumber,  hotelPrice];
            try {
                await db.query(query, values);
                resolve(true)
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    },
    getLastOrderByEmail: (email) => {
        return new Promise(async (resolve, reject) => {
            const query = `SELECT * FROM bookingdetails WHERE email = $1 ORDER BY created_at DESC LIMIT 1`;
            const values = [email];
            try {
                const result = await db.query(query, values);
                const lastOrder = result.rows[0];
                const orderDetails = {
                    id: lastOrder.booking_id,
                    hotelName: lastOrder.hotel_name,
                    price: lastOrder.price,
                    firstName: lastOrder.first_name,
                    lastName: lastOrder.last_name,
                    email: lastOrder.email,
                    phoneNumber: lastOrder.phone_number,
                    checkInDate: lastOrder.check_in_date,
                    checkOutDate: lastOrder.check_out_date,
                    roomType: lastOrder.room_type,
                    numGuests: lastOrder.num_guests,
                    cardName: lastOrder.card_name,
                    cardNumber: lastOrder.card_number
                };
                resolve(orderDetails);
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    },
    getAllOrders: (email) => {
        return new Promise(async (resolve, reject) => {
            let orders = [];
            const query = `select * from bookingdetails where email = $1`;
            const values = [email];
            try {
                const result = await db.query(query, values);
                const allOrders = result.rows;
                allOrders.forEach((element) => {
                    orders.push({
                        id: element.booking_id,
                        hotelName: element.hotel_name,
                        price: element.price,
                        firstName: element.first_name,
                        lastName: element.last_name,
                        email: element.email,
                        phoneNumber: element.phone_number,
                        checkInDate: element.check_in_date,
                        checkOutDate: element.check_out_date,
                        roomType: element.room_type,
                        numGuests: element.num_guests,
                        cardName: element.card_name,
                        cardNumber: element.card_number
                    })
                })
                resolve(orders);
            } catch (e) {
                console.log(e);
            }
        })
    },
    getSpecificOrder: (id) => {
        console.log(id);

        return new Promise(async (resolve, reject) => {

            const query = `select * from bookingdetails where booking_id = $1`;
            const values = [id];
            try {
                const result = await db.query(query, values);
                const lastOrder = result.rows[0];
                const orderDetails = {
                    id: lastOrder.booking_id,
                    hotelName: lastOrder.hotel_name,
                    price: lastOrder.price,
                    firstName: lastOrder.first_name,
                    lastName: lastOrder.last_name,
                    email: lastOrder.email,
                    phoneNumber: lastOrder.phone_number,
                    checkInDate: lastOrder.check_in_date,
                    checkOutDate: lastOrder.check_out_date,
                    roomType: lastOrder.room_type,
                    numGuests: lastOrder.num_guests,
                    cardName: lastOrder.card_name,
                    cardNumber: lastOrder.card_number
                };
                resolve(orderDetails);
            } catch (e) {
                console.log(e);
            }
        })

    },
    addToCart: (email, hotelId) => {
        return new Promise(async (resolve, reject) => {
            const query = `INSERT INTO cart (user_email, hotel_id) VALUES ($1, $2)`;
            const values = [email, hotelId];
            try {
                await db.query(query, values);
                resolve();
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    },
    getCartItems : (email) => {
        return new Promise(async (resolve, reject) => {
            const query = `SELECT hotel_id FROM cart WHERE user_email = $1`;
            const values = [email];
            try {
                const result = await db.query(query, values);
                resolve(result.rows);
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    },
    
   getHotelsByIds :(ids) => {
        return new Promise(async (resolve, reject) => {
            const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
            const query = `SELECT id, hotelname, hotelphoto, price FROM hoteldetails WHERE id IN (${placeholders})`;
            const values = ids;
            try {
                const result = await db.query(query, values);
                resolve(result.rows);
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    },

    
        removeFromCart: (email, hotelId) => {
            return new Promise(async (resolve, reject) => {
                const query = `DELETE FROM cart WHERE user_email = $1 AND hotel_id = $2`;
                const values = [email, hotelId];
                try {
                    await db.query(query, values);
                    resolve();
                } catch (e) {
                    console.log(e);
                    reject(e);
                }
            });
        },
    
        // ...other methods
    
    
    
    



}
export default userHelper;