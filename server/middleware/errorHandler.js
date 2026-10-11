// Centralized Backend Error Handler for የኔ ኪራይ (Yene Kiray)

export const errorHandler = (err, req, res, next) => {
  // Log complete error details on server for diagnostics
  console.error(`💥 [${new Date().toISOString()}] Server Error on ${req.method} ${req.originalUrl}:`, {
    message: err.message,
    code: err.code,
    status: err.status || err.statusCode,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  let statusCode = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errorType = 'SERVER_ERROR';

  // 1. PostgreSQL Connection & Database Downtime Errors
  if (
    err.code === 'ECONNREFUSED' ||
    err.code === 'ETIMEDOUT' ||
    err.code === '57P01' || // admin shutdown
    err.code === '08006' || // connection failure
    err.code === '08001' || // unable to establish connection
    err.message?.includes('Connection terminated') ||
    err.message?.includes('Connection closed')
  ) {
    statusCode = 503;
    errorType = 'DATABASE_UNAVAILABLE';
    message = 'የዳታቤዝ ግንኙነት በጊዜያዊነት ተቋርጧል፣ እባክዎ ትንሽ ቆይተው እንደገና ይሞክሩ (Database service temporarily unreachable. Please retry in a moment.)';
  }

  // 2. PostgreSQL Unique Constraint Violation (Duplicate email, phone, etc.)
  else if (err.code === '23505') {
    statusCode = 409;
    errorType = 'DUPLICATE_RESOURCE';
    if (err.detail?.includes('email')) {
      message = 'ይህ ኢሜይል አስቀድሞ ተመዝግቧል (This email address is already registered.)';
    } else if (err.detail?.includes('phone')) {
      message = 'ይህ ስልክ ቁጥር አስቀድሞ ተመዝግቧል (This phone number is already registered.)';
    } else {
      message = 'ይህ መረጃ አስቀድሞ በሲስተሙ ውስጥ ይገኛል (This record already exists in the system.)';
    }
  }

  // 3. PostgreSQL Foreign Key or Invalid Data Type
  else if (err.code === '23503') {
    statusCode = 400;
    errorType = 'INVALID_REFERENCE';
    message = 'የተጠቀሰው መረጃ በሲስተሙ ውስጥ አልተገኘም (Referenced resource not found.)';
  } else if (err.code === '22P02') {
    statusCode = 400;
    errorType = 'INVALID_FORMAT';
    message = 'የተላከው መረጃ ቅርጸት ትክክል አይደለም (Invalid parameter format provided.)';
  }

  // 4. Multer File Upload Errors
  else if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    errorType = 'PAYLOAD_TOO_LARGE';
    message = 'የምስሉ መጠን በጣም ትልቅ ነው፣ እባክዎ ከ15MB በታች የሆነ ምስል ይጠቀሙ (Image file too large, maximum allowed size is 15MB.)';
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    errorType = 'UNEXPECTED_FILE';
    message = 'ያልተጠበቀ የምስል ሰነድ (Unexpected file field encountered.)';
  }

  // 5. JWT Authentication Errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorType = 'INVALID_TOKEN';
    message = 'የተሳሳተ የማረጋገጫ መለያ፣ እባክዎ እንደገና ይግቡ (Invalid authentication token. Please sign in again.)';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorType = 'TOKEN_EXPIRED';
    message = 'የማረጋገጫ ጊዜው አልቋል፣ እባክዎ እንደገና ይግቡ (Session expired. Please sign in again.)';
  }

  // 6. Generic 500 Server Fallback
  else if (statusCode === 500) {
    message = 'የሰርቨር ችግር አጋጥሟል፣ እባክዎ ትንሽ ቆይተው እንደገና ይሞክሩ (An unexpected server error occurred. Please try again.)';
  }

  return res.status(statusCode).json({
    success: false,
    errorType,
    message,
    statusCode,
    timestamp: new Date().toISOString()
  });
};
