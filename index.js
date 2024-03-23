const httpServer = require('http').createServer()
const io = require("socket.io")(httpServer, {
    cors: {
        // The origin is the same as the Vue app domain. Change if necessary
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
})
httpServer.listen(8080, () => {
    console.log('listening on *:8080')
})
io.on('connection', (socket) => {
    console.log(`client ${socket.id} has connected`)
    //notificar chefs que alguma order item foi alterado
    socket.on('updatedOrderItem', (orderItem) => {
        socket.broadcast.emit('updatedOrderItem', orderItem)
        console.log('updated OrderItem')
    })

    //notificar employee delivery que alguma order foi alterada
    socket.on('updatedOrder', (order) => {
        socket.broadcast.emit('updatedOrder', order)
        console.log('updated Order')
    })


    //user logs in
    socket.on('loggedIn', function (user) {
        console.log(user.id + " logged in")
        socket.join(user.id)
        if (user.type == 'EM') {
            socket.join('manager')
        }

        if (user.type == 'EC') {
            socket.join('chef')
        }

        if (user.type == 'ED') {
            socket.join('delivery')
        }
    })
    //user logs out
    socket.on('loggedOut', function (user) {
        console.log(user.id + " logged out")
        socket.leave(user.id)
        socket.leave('manager')
    })

    //update user
    socket.on('updateUser', function (user) {
        console.log('update user')
        socket.in('manager').except(user.id).emit('updateUser', user)
        socket.in(user.id).emit('updateUser', user)
    })

    //notificar chef que um novo hot dish foi pedido
    socket.on('newHotDish', (product) => {
        socket.in('chef').emit('newHotDish', product)
        console.log('hotdish')
    })

    //notificar customer que a sua order foi cancelada
    socket.on('orderCanceled', (order) => {
        socket.broadcast.emit('orderCanceled', order)
        console.log('order canceled')
    })

    //notificar delivery employee que hot dish esta pronto
    socket.on('hotDishReady', (order) => {
        socket.in('delivery').emit('hotDishReady', order)
        console.log('hot dish ready')
    })

    //order ready for pickup
    socket.on('orderReady', (order) => {
        socket.broadcast.emit('orderReady', order)
        console.log('order ready')
    })

    socket.on('deleteUser', function (user) {
        console.log('delete user')
        socket.in('manager').emit('deleteUser', user)
    })

    socket.on('newUser', function (user) {
        console.log('new user')
        socket.in('manager').emit('newUser', user)
    })

    socket.on('updateMenu', function () {
        console.log('menu updated')
        socket.in('manager').emit('updateMenu')
    })

    socket.on('newOrder', function () {
        socket.in('manager').emit('newOrder')
    })
})