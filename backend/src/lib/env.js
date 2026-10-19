// Imported first by src/index.js so these apply before any other module runs.
import "dotenv/config";

// Event dates are campus-local. Without this a UTC host would think "today"
// ends at 5:30 AM IST.
process.env.TZ ||= "Asia/Kolkata";
