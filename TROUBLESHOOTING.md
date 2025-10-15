# 🔧 Troubleshooting Guide

## 🚨 **Common Issues & Solutions**

### **1. "Get Offer" Button Error (localStorage Issues)**

**Symptoms:**
- Console error: "Error saving categories"
- Circular update loops
- Button clicks not working properly

**Root Cause:**
- localStorage quota exceeded
- Circular dependency in category count updates
- Rapid successive update calls

**✅ Solutions Applied:**
- **Debouncing mechanism**: 100ms delay prevents rapid updates
- **Subscription loop prevention**: Using `take(1)` operator
- **Quota handling**: Automatic cleanup when storage full
- **Error recovery**: App continues working even if storage fails

**Manual Fix (if needed):**
```javascript
// In browser console:
localStorage.clear(); // Clear all data
// Or specific cleanup:
localStorage.removeItem('app_errors');
localStorage.removeItem('referral_categories');
localStorage.removeItem('referral_offers');
```

### **2. 404 Page Not Working**

**Symptoms:**
- GitHub Pages shows default 404
- Client-side routes not working

**Solutions:**
- Custom `404.html` implemented
- Automatic redirect to main app
- Session storage for preserving URLs

**Manual Fix:**
- Ensure GitHub Pages is set to "GitHub Actions" source
- Check if `404.html` exists in deployed files

### **3. Network/Offline Issues**

**Symptoms:**
- App not loading
- Features not working offline

**Solutions:**
- Network error page with retry functionality
- Offline detection and handling
- Service worker integration

### **4. Performance Issues**

**Symptoms:**
- Slow loading
- High memory usage
- localStorage warnings

**Solutions:**
- Bundle size optimization
- Lazy loading implemented
- localStorage size monitoring

## 🛠️ **Debugging Tools**

### **Check localStorage Usage:**
```javascript
// In browser console:
const errorHandler = document.querySelector('app-root')?.__ngContext__?.[0]?.injector?.get('ErrorHandlerService');
console.log(errorHandler?.getLocalStorageInfo());
```

### **View Stored Errors:**
```javascript
// In browser console:
JSON.parse(localStorage.getItem('app_errors') || '[]')
```

### **Clear Storage:**
```javascript
// In browser console:
const errorHandler = document.querySelector('app-root')?.__ngContext__?.[0]?.injector?.get('ErrorHandlerService');
errorHandler?.cleanupLocalStorage();
```

### **Check Categories:**
```javascript
// In browser console:
JSON.parse(localStorage.getItem('referral_categories') || '[]')
```

### **Check Offers:**
```javascript
// In browser console:
JSON.parse(localStorage.getItem('referral_offers') || '[]')
```

## 🔍 **Error Monitoring**

### **Development Mode:**
- All errors logged to console
- Detailed stack traces
- Real-time debugging

### **Production Mode:**
- Errors stored in localStorage
- User-friendly messages
- Automatic error recovery

## 🚀 **Performance Optimization**

### **localStorage Management:**
- Automatic cleanup when quota exceeded
- Size validation before writes
- Graceful fallback when unavailable

### **Update Optimization:**
- Debounced category count updates
- Prevented circular dependencies
- Efficient data synchronization

## 📱 **Mobile-Specific Issues**

### **Touch Events:**
- Enhanced touch targets (44px minimum)
- Improved mobile navigation
- Better responsive design

### **Storage Limitations:**
- Mobile browsers have smaller localStorage limits
- Automatic cleanup more aggressive on mobile
- Fallback to memory-only storage when needed

## 🔧 **Admin Panel Issues**

### **Authentication:**
- Default password: `admin123`
- Session-based authentication
- Automatic logout on errors

### **Data Management:**
- Category and offer management
- Bulk operations support
- Data validation and error handling

## 🌐 **Deployment Issues**

### **GitHub Pages:**
- Custom 404.html for SPA routing
- Proper base href configuration
- Asset optimization

### **Build Issues:**
- Node.js version compatibility (20+)
- Bundle size warnings (acceptable)
- TypeScript strict mode compliance

## 📞 **Getting Help**

### **Check These First:**
1. Browser console for errors
2. Network tab for failed requests
3. localStorage usage and quota
4. GitHub Actions deployment logs

### **Common Solutions:**
1. Clear browser cache and localStorage
2. Hard refresh (Ctrl+F5 or Cmd+Shift+R)
3. Check internet connection
4. Verify GitHub Pages is enabled

### **Still Having Issues?**
- Check the ERROR_HANDLING_GUIDE.md for detailed error handling
- Review GitHub Actions logs for deployment issues
- Use browser dev tools for debugging
- Clear all browser data as last resort

## ✅ **Health Check**

Your app is working correctly if:
- ✅ Home page loads with categories
- ✅ Category pages show offers
- ✅ "Get Offer" buttons open referral links
- ✅ Admin panel is accessible
- ✅ No console errors (except warnings)
- ✅ Mobile navigation works smoothly

The application is designed to be resilient and continue working even when individual components encounter errors.