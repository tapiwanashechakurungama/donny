const { Sequelize, DataTypes } = require('sequelize');

// Database configuration
const sequelize = new Sequelize(
  "bn1cfdeunbmtwpft2rod",
  "ukdmkxlhycbhvxkz",
  "Rjlti3eC9wdTbFq0gFKT",
  {
    host: "bn1cfdeunbmtwpft2rod-mysql.services.clever-cloud.com",
    port: 3306,
    dialect: 'mysql',
    dialectModule: require('mysql2'),
    logging: console.log,
  }
);

async function setupDatabase() {
  try {
    console.log('🔗 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully!');

    // Define User model
    const User = sequelize.define('User', {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      profilePicture: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      isEmailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      emailVerificationToken: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      emailVerificationExpires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      passwordResetToken: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      passwordResetExpires: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    }, {
      tableName: 'users',
      timestamps: true,
    });

    // Define Post model
    const Post = sequelize.define('Post', {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      imageUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      authorId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: User,
          key: 'id',
        },
      },
    }, {
      tableName: 'posts',
      timestamps: true,
    });

    // Define Event model
    const Event = sequelize.define('Event', {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      maxAttendees: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      createdBy: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: User,
          key: 'id',
        },
      },
      status: {
        type: DataTypes.ENUM('upcoming', 'ongoing', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'upcoming',
      },
      eventPicture: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
    }, {
      tableName: 'events',
      timestamps: true,
    });

    // Define EventRequest model
    const EventRequest = sequelize.define('EventRequest', {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      eventId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: Event,
          key: 'id',
        },
      },
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: User,
          key: 'id',
        },
      },
      status: {
        type: DataTypes.ENUM('pending', 'accepted', 'declined'),
        allowNull: false,
        defaultValue: 'pending',
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    }, {
      tableName: 'event_requests',
      timestamps: true,
    });

    // Define Like model
    const Like = sequelize.define('Like', {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: User,
          key: 'id',
        },
      },
      postId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: Post,
          key: 'id',
        },
      },
    }, {
      tableName: 'likes',
      timestamps: true,
    });

    // Define Comment model
    const Comment = sequelize.define('Comment', {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: User,
          key: 'id',
        },
      },
      postId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: Post,
          key: 'id',
        },
      },
    }, {
      tableName: 'comments',
      timestamps: true,
    });

    // Define Notification model
    const Notification = sequelize.define('Notification', {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: User,
          key: 'id',
        },
      },
      type: {
        type: DataTypes.ENUM('like', 'comment', 'event_request', 'event_accepted', 'event_declined', 'follow'),
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      relatedId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      relatedType: {
        type: DataTypes.ENUM('post', 'event', 'user'),
        allowNull: true,
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    }, {
      tableName: 'notifications',
      timestamps: true,
    });

    // Setup associations
    User.hasMany(Post, { foreignKey: 'authorId', as: 'posts' });
    Post.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

    User.hasMany(Event, { foreignKey: 'createdBy', as: 'createdEvents' });
    Event.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

    Event.hasMany(EventRequest, { foreignKey: 'eventId', as: 'requests' });
    EventRequest.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

    User.hasMany(EventRequest, { foreignKey: 'userId', as: 'eventRequests' });
    EventRequest.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    User.hasMany(Like, { foreignKey: 'userId', as: 'likes' });
    Post.hasMany(Like, { foreignKey: 'postId', as: 'likes' });
    Like.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    Like.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

    User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
    Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });
    Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

    User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
    Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    // Create all tables
    console.log('🏗️  Creating tables...');
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ All tables created successfully!');

    // List all tables
    const [tables] = await sequelize.query('SHOW TABLES');
    console.log('📋 Available tables:', tables.map(t => Object.values(t)[0]));

    console.log('\n🎉 Database setup completed successfully!');
    console.log('🔐 You can now register users and use the application!');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    await sequelize.close();
  }
}

setupDatabase();
