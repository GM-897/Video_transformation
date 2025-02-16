const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    profileImage: {
      type: String
    },
    // lastLogin: {
    //   type: Date,
    //   default: Date.now
    // },
    // isActive: {
    //   type: Boolean,
    //   default: true
    // },
    // preferences: {
    //   theme: {
    //     type: String,
    //     enum: ['light', 'dark'],
    //     default: 'light'
    //   },
    //   notifications: {
    //     type: Boolean,
    //     default: true
    //   }
    // }
  },
  {
    timestamps: true // Adds createdAt and updatedAt automatically
  }
);

// Index for faster queries
userSchema.index({ email: 1, clerkId: 1 });

// Method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = Date.now();
  return this.save();
};

// Static method to find or create user from Clerk data
userSchema.statics.findOrCreateFromClerk = async function(clerkData) {
  try {
    let user = await this.findOne({ clerkId: clerkData.id });
    
    if (!user) {
      user = await this.create({
        clerkId: clerkData.id,
        email: clerkData.emailAddresses[0].emailAddress,
        firstName: clerkData.firstName,
        lastName: clerkData.lastName,
        profileImage: clerkData.profileImageUrl
      });
    }

    await user.updateLastLogin();
    return user;
  } catch (error) {
    console.error('Error in findOrCreateFromClerk:', error);
    throw error;
  }
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included in JSON output
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User; 