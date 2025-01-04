import db from '../database/data.js'
const adminHelper = {
    addAdmin: (details) => {
        const name = details.adminName;
        const phone = details.phoneNumber;
        console.log(name, phone);
        return new Promise(async (resolve, reject) => {
            const query = `insert into admins(adminName,adminPhone) values ($1,$2)`
            const values = [name, phone];
            try {
                await db.query(query, values);
                resolve(true)

            } catch (err) {
                console.log('error in inserting admin ');
            }

        })


    },
    isAdmin: (detail) => {
        const name = detail.username;
        return new Promise(async (resolve, reject) => {
            const query = `SELECT adminName FROM admins WHERE adminName=$1`;
            const values = [name];
            try {
                const result = await db.query(query, values);
                if (result.rows.length > 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            } catch (err) {
                console.log('Error in searching for admin username:', err);
                reject(err);
            }
        });
    },
    hotelDetail: (details, photo) => {
        const { adminName, hotelName, description, location, phoneNumber, price } = details;
        console.log('adminName:', adminName, 'hotelName:', hotelName, 'description:', description, 'phoneNumber:', phoneNumber);
        return new Promise(async (resolve, reject) => {
            try {
                const query = `insert into hoteldetails (ownerName,hotelName,hotelPhoto,locations,description,phoneNumber,price) values ($1,$2,$3,$4,$5,$6,$7)`;
                const values = [adminName, hotelName, photo, location, description, phoneNumber, price];
                await db.query(query, values);
                resolve(true)

            } catch (e) {
                console.log('error occur in inserting details');
                reject(e)
            }
        })
    },

    adminPost: (username) => {
        return new Promise(async (resolve, reject) => {
            let hotels = [];
            const query = `select * from hoteldetails where ownername = $1`;
            const values = [username];
            try {
                const product = await db.query(query, values);
                const result = product.rows;
                result.forEach((element) => {
                    hotels.push({ photo: element.hotelphoto, name: element.hotelname, description: element.description, price: element.price, location: element.locations, id: element.id })
                })
                resolve(hotels);

            } catch (e) {
                console.log(e);
                reject(e);


            }
        })
    },
    getSpecificAdminPost: (id) => {
        return new Promise(async (resolve, reject) => {
            const query = `select * from hoteldetails where id=$1`;
            const values = [id];
            try {
                const result = await db.query(query, values);
                const product = result.rows[0];
                const hotelDetails = {
                    id: product.id,
                    ownername: product.ownername,
                    hotelname: product.hotelname,
                    hotelphoto: product.hotelphoto,
                    description: product.description,
                    phonenumber: product.phonenumber,
                    price: product.price,
                    location: product.locations
                };
                resolve(hotelDetails);

            } catch (e) {
                console.log(e);
                reject(e)

            }
        })
    },
    updateHotel: (id, updatedHotelData) => {
        return new Promise((resolve, reject) => {
            const query = `
                UPDATE hoteldetails
                SET ownername = $1, hotelname = $2, hotelphoto = $3, description = $4, phonenumber = $5, price = $6, locations = $7
                WHERE id = $8
            `;
            const values = [
                updatedHotelData.ownername,
                updatedHotelData.hotelname,
                updatedHotelData.hotelphoto,
                updatedHotelData.description,
                updatedHotelData.phonenumber,
                updatedHotelData.price,
                updatedHotelData.location,
                id
            ];
    
            db.query(query, values, (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(true);
            });
        });
    },



    // Function to get hotel IDs by owner name
    getHotelId: (username) => {
        return new Promise(async (resolve, reject) => {
            const query = `SELECT id FROM hoteldetails WHERE ownername=$1`;
            const values = [username];
            try {
                const result = await db.query(query, values);
                resolve(result.rows);
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    },

    // Function to get orders by hotel IDs
    getOrderByIds: (ids) => {
        return new Promise(async (resolve, reject) => {
            const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
            const query = `SELECT * FROM bookingdetails WHERE hotel_id IN (${placeholders})`;
            const values = ids;
            try {
                const result = await db.query(query, values);
                const lastOrder = result.rows;
              
                resolve(lastOrder);
            } catch (e) {
                console.log(e);
            }
        });
    },

    getSpeificOrderDetail:(id)=>{
        return new Promise(async(resolve,reject)=>{
            const query=`select * from bookingdetails where booking_id=$1`;
            const values=[id];
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
    deleteHotel: (username, hotelId) => {
        return new Promise(async (resolve, reject) => {
            const query = `DELETE FROM hoteldetails WHERE ownername = $1 AND id = $2`;
            const values = [username, hotelId];
            try {
                await db.query(query, values);
                resolve();
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    },


}

export default adminHelper;