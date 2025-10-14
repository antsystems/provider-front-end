# 🧹 **FRONTEND & BACKEND CLEANUP PLAN**

## 🎯 **SEPARATE FRONTEND & BACKEND COMPLETELY**

### **📁 NEW STRUCTURE:**
```
Desktop/
├── claim-backend/          # Backend only
└── claim-frontend/         # Frontend only
```

---

## 🔧 **BACKEND CLEANUP - REMOVE UNUSED FILES**

### **❌ REMOVE THESE FILES:**
```bash
# Remove unused routes
rm app/routes/users.py

# Remove unused utils
rm app/utils/validators.py

# Remove empty directories
rm -rf app/models/

# Remove documentation files
rm *.md
```

### **✅ KEEP THESE FILES:**
```
claim-backend/
├── app.py                          # Main entry point
├── requirements.txt                # Dependencies
├── ServiceAccountKey.json          # Firebase credentials
└── app/
    ├── __init__.py                 # Flask app factory
    ├── config/
    │   ├── config.py              # App configuration
    │   └── firebase_config.py     # Firebase setup
    ├── middleware/
    │   └── auth_middleware.py     # Authentication
    ├── routes/
    │   ├── auth.py                # Login
    │   ├── claims.py              # Claims management
    │   ├── resources.py           # Dropdown data
    │   ├── firebase.py            # Firebase auth
    │   └── inbox.py               # Inbox functionality
    └── utils/
        └── error_handlers.py      # Error handling
```

---

## 🎨 **FRONTEND CLEANUP - REMOVE UNUSED COMPONENTS**

### **❌ REMOVE THESE UNUSED COMPONENTS:**

#### **1. Unused Chart Components:**
```bash
rm src/components/ChartCard.tsx
rm src/components/charts/BarChart.tsx
rm src/components/charts/DonutChart.tsx
rm src/components/charts/RadialChart.tsx
rm src/components/DashboardCharts.tsx
rm src/components/SimpleLineChart.tsx
```

#### **2. Unused Example Components:**
```bash
rm src/components/examples/UIExamples.tsx
```

#### **3. Unused UI Components (not imported anywhere):**
```bash
rm src/components/ui/accordion.tsx
rm src/components/ui/alert-dialog.tsx
rm src/components/ui/alert.tsx
rm src/components/ui/avatar.tsx
rm src/components/ui/badge.tsx
rm src/components/ui/breadcrumb.tsx
rm src/components/ui/checkbox.tsx
rm src/components/ui/command.tsx
rm src/components/ui/confirm-dialog.tsx
rm src/components/ui/data-table.tsx
rm src/components/ui/dropdown-menu.tsx
rm src/components/ui/empty-state.tsx
rm src/components/ui/form.tsx
rm src/components/ui/popover.tsx
rm src/components/ui/progress.tsx
rm src/components/ui/sheet.tsx
rm src/components/ui/tabs.tsx
```

#### **4. Unused Services:**
```bash
rm src/services/cache.ts
```

#### **5. Unused Hooks:**
```bash
rm src/hooks/useCounterAnimation.ts
rm src/hooks/useDebounce.ts
```

#### **6. Unused Lib Files:**
```bash
rm src/lib/auth.ts
```

#### **7. Unused Types:**
```bash
rm src/types/global.d.ts
```

---

## ✅ **FRONTEND - KEEP THESE FILES (ACTUALLY USED):**

### **📁 Essential Structure:**
```
claim-frontend/
├── package.json                    # Dependencies
├── next.config.ts                  # Next.js config
├── tailwind.config.ts              # Tailwind config
├── tsconfig.json                   # TypeScript config
└── src/
    ├── app/                        # Next.js app router
    │   ├── page.tsx               # Home page
    │   ├── layout.tsx             # Root layout
    │   ├── loading.tsx            # Loading page
    │   ├── globals.css            # Global styles
    │   ├── login/page.tsx         # Login page
    │   ├── dashboard/             # Dashboard
    │   ├── claims/                # Claims submission
    │   ├── claims-inbox/          # Claims inbox
    │   └── profile/               # User profile
    ├── components/
    │   ├── auth/                  # Authentication components
    │   │   ├── ProtectedRoute.tsx
    │   │   ├── PublicRoute.tsx
    │   │   └── RoleProtectedRoute.tsx
    │   ├── forms/                 # Form components
    │   │   ├── AddIPClaimDialog.tsx
    │   │   └── ClaimDetailsDialog.tsx
    │   ├── layout/                # Layout components
    │   │   ├── Breadcrumb.tsx
    │   │   ├── MainLayout.tsx
    │   │   ├── Sidebar.tsx
    │   │   └── TopNavigation.tsx
    │   ├── tables/                # Table components
    │   │   └── ClaimsTable.tsx
    │   ├── skeletons/             # Loading skeletons
    │   │   ├── CardSkeleton.tsx
    │   │   └── TableSkeleton.tsx
    │   ├── dashboard/             # Dashboard components
    │   │   └── AnimatedStatCard.tsx
    │   ├── ui/                    # Essential UI components
    │   │   ├── button.tsx
    │   │   ├── card.tsx
    │   │   ├── dialog.tsx
    │   │   ├── input.tsx
    │   │   ├── label.tsx
    │   │   ├── select.tsx
    │   │   ├── separator.tsx
    │   │   ├── skeleton.tsx
    │   │   ├── table.tsx
    │   │   ├── textarea.tsx
    │   │   ├── toast.tsx
    │   │   └── toaster.tsx
    │   ├── CommandPalette.tsx     # Command palette
    │   ├── GlobalLoadingProvider.tsx
    │   └── LoadingScreen.tsx
    ├── contexts/
    │   └── AuthContext.tsx        # Auth context
    ├── hooks/
    │   └── use-toast.ts           # Toast hook
    ├── lib/
    │   ├── toast.tsx              # Toast utilities
    │   └── utils.ts               # Utility functions
    ├── providers/
    │   └── AuthProvider.tsx       # Auth provider
    ├── services/
    │   ├── auth.ts                # Auth service
    │   ├── claimsApi.ts           # Claims API
    │   ├── firebaseClient.ts      # Firebase client
    │   └── hospitalSummaryApi.ts  # Hospital summary API
    └── types/
        ├── auth.ts                # Auth types
        ├── claims.ts              # Claims types
        └── roles.ts               # Role types
```

---

## 🚀 **EXECUTION STEPS:**

### **Step 1: Create Separate Directories**
```bash
# Create backend directory
mkdir /Users/snehapatil/Desktop/claim-backend
mkdir /Users/snehapatil/Desktop/claim-frontend

# Move backend files
cp -r /Users/snehapatil/Desktop/claim/app /Users/snehapatil/Desktop/claim-backend/
cp /Users/snehapatil/Desktop/claim/app.py /Users/snehapatil/Desktop/claim-backend/
cp /Users/snehapatil/Desktop/claim/requirements.txt /Users/snehapatil/Desktop/claim-backend/
cp /Users/snehapatil/Desktop/claim/ServiceAccountKey.json /Users/snehapatil/Desktop/claim-backend/

# Move frontend files
cp -r "/Users/snehapatil/Desktop/claim/frontend/Claims Front END" /Users/snehapatil/Desktop/claim-frontend/
```

### **Step 2: Clean Backend**
```bash
cd /Users/snehapatil/Desktop/claim-backend
rm app/routes/users.py
rm app/utils/validators.py
rm -rf app/models/
rm *.md
```

### **Step 3: Clean Frontend**
```bash
cd "/Users/snehapatil/Desktop/claim-frontend/Claims Front END"
rm src/components/ChartCard.tsx
rm src/components/charts/BarChart.tsx
rm src/components/charts/DonutChart.tsx
rm src/components/charts/RadialChart.tsx
rm src/components/DashboardCharts.tsx
rm src/components/SimpleLineChart.tsx
rm src/components/examples/UIExamples.tsx
rm src/services/cache.ts
rm src/hooks/useCounterAnimation.ts
rm src/hooks/useDebounce.ts
rm src/lib/auth.ts
rm src/types/global.d.ts
rm -rf src/components/charts/
rm -rf src/components/examples/
```

### **Step 4: Update Backend App Registration**
```python
# In claim-backend/app/__init__.py, remove users_bp
```

---

## 📊 **RESULTS AFTER CLEANUP:**

### **Backend Size Reduction:**
- **Before**: ~15 files
- **After**: ~12 files
- **Removed**: 3 unused files

### **Frontend Size Reduction:**
- **Before**: ~60+ components
- **After**: ~25 essential components  
- **Removed**: 35+ unused components

### **Benefits:**
- ✅ **Faster builds**
- ✅ **Smaller bundle size**
- ✅ **Easier maintenance**
- ✅ **Cleaner codebase**
- ✅ **Separated concerns**
