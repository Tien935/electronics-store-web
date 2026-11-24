# Sử dụng base image JRE 21 siêu nhẹ trên nền Alpine Linux
FROM eclipse-temurin:21-jre-alpine

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Sao chép file JAR đã build từ Maven vào container
COPY target/*.jar app.jar

# Khai báo cổng của Order Service
EXPOSE 8084

# Cấu hình biến môi trường và bộ nhớ JVM tối ưu
ENV SPRING_PROFILES_ACTIVE=default \
    JAVA_OPTS="-Xms256m -Xmx512m"

# Khởi chạy ứng dụng Spring Boot
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
