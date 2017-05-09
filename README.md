# redis-mysql-orders
## MySQL Database: orders_test 
  - orders:
    id: Int, PRIMARY KEY, AUTO INCREASE
    orderDate: Date
  - orderDetails:
    id: Int, PRIMARY KEY, AUTO INCREASE,
    orderId: Int, FOREIGN KEY
    productId: Int, FOREIGN KEY
  - products:
    id: Int, PRIMARY KEY, AUTO INCREASE,
    name: varchar
