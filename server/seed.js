const bcrypt = require('bcryptjs');
const { sequelize, User, Book, Ebook, Transaction, Reservation, Review } = require('./models');
const calculateFine = require('./utils/calculateFine');

async function seedDatabase() {
  try {
    console.log('Syncing database schema (force: true)...');
    await sequelize.sync({ force: true });

    // 1. Password Hashing Helper
    const hashPassword = async (pwd) => await bcrypt.hash(pwd, 10);

    // 2. Create Users (1 Admin + 6 Members)
    console.log('Seeding Users...');
    const adminPassword = await hashPassword('admin123');
    const memberPassword = await hashPassword('member123');

    const admin = await User.create({
      name: 'Dr. Robert Vance (Librarian)',
      email: 'admin@library.com',
      password_hash: adminPassword,
      role: 'admin',
      phone: '+1-555-0199',
      membership_id: 'LIB-ADMIN-01',
      join_date: '2023-01-15'
    });

    const members = await User.bulkCreate([
      {
        name: 'Alice Johnson',
        email: 'alice@student.edu',
        password_hash: memberPassword,
        role: 'member',
        phone: '+91 98765 43210',
        membership_id: 'MEM-2024-001',
        join_date: '2024-02-10'
      },
      {
        name: 'Bob Smith',
        email: 'bob@student.edu',
        password_hash: memberPassword,
        role: 'member',
        phone: '+91 87654 32109',
        membership_id: 'MEM-2024-002',
        join_date: '2024-02-15'
      },
      {
        name: 'Charlie Davis',
        email: 'charlie@student.edu',
        password_hash: memberPassword,
        role: 'member',
        phone: '+91 99887 77665',
        membership_id: 'MEM-2024-003',
        join_date: '2024-03-01'
      },
      {
        name: 'Diana Prince',
        email: 'diana@student.edu',
        password_hash: memberPassword,
        role: 'member',
        phone: '+91 91234 56789',
        membership_id: 'MEM-2024-004',
        join_date: '2024-03-12'
      },
      {
        name: 'Ethan Hunt',
        email: 'ethan@student.edu',
        password_hash: memberPassword,
        role: 'member',
        phone: '+91 92345 67890',
        membership_id: 'MEM-2024-005',
        join_date: '2024-04-05'
      },
      {
        name: 'Fiona Gallagher',
        email: 'fiona@student.edu',
        password_hash: memberPassword,
        role: 'member',
        phone: '+91 93456 78901',
        membership_id: 'MEM-2024-006',
        join_date: '2024-05-20'
      }
    ]);

    // 3. Create 15 Books
    console.log('Seeding Books...');
    const books = await Book.bulkCreate([
      {
        title: 'Database System Concepts',
        author: 'Abraham Silberschatz, Henry F. Korth',
        genre: 'Computer Science',
        isbn: '978-0078022159',
        description: 'Comprehensive overview of database management systems, relational model, SQL, transactions, and indexing.',
        cover_image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500',
        total_copies: 5,
        available_copies: 2,
        added_date: '2024-01-10'
      },
      {
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        author: 'Robert C. Martin',
        genre: 'Software Engineering',
        isbn: '978-0132350884',
        description: 'A masterpiece on writing clean, readable, maintainable software and refactoring legacy code.',
        cover_image_url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500',
        total_copies: 4,
        available_copies: 1,
        added_date: '2024-01-15'
      },
      {
        title: 'Introduction to Algorithms (CLRS)',
        author: 'Thomas H. Cormen, Charles E. Leiserson',
        genre: 'Computer Science',
        isbn: '978-0262033848',
        description: 'The standard textbook on algorithm design, analysis, dynamic programming, and graph algorithms.',
        cover_image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500',
        total_copies: 3,
        available_copies: 0, // All copies checked out / reserved
        added_date: '2024-02-01'
      },
      {
        title: 'Artificial Intelligence: A Modern Approach',
        author: 'Stuart Russell, Peter Norvig',
        genre: 'Artificial Intelligence',
        isbn: '978-0134610993',
        description: 'Leading textbook in AI, covering search techniques, knowledge representation, machine learning, and robotics.',
        cover_image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500',
        total_copies: 4,
        available_copies: 2,
        added_date: '2024-02-10'
      },
      {
        title: 'Operating System Concepts',
        author: 'Abraham Silberschatz, Peter B. Galvin',
        genre: 'Computer Science',
        isbn: '978-1118063330',
        description: 'Fundamental concepts of operating systems, process scheduling, memory management, and file systems.',
        cover_image_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500',
        total_copies: 3,
        available_copies: 1,
        added_date: '2024-02-20'
      },
      {
        title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
        author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
        genre: 'Software Engineering',
        isbn: '978-0201633610',
        description: 'The Classic Gang of Four book detailing 23 reusable software architectural design patterns.',
        cover_image_url: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=500',
        total_copies: 4,
        available_copies: 3,
        added_date: '2024-03-01'
      },
      {
        title: 'Computer Networking: A Top-Down Approach',
        author: 'James F. Kurose, Keith W. Ross',
        genre: 'Computer Networks',
        isbn: '978-0133594140',
        description: 'Focuses on the internet and application layer down to link layer protocols in a structured manner.',
        cover_image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500',
        total_copies: 3,
        available_copies: 1,
        added_date: '2024-03-05'
      },
      {
        title: 'JavaScript: The Good Parts',
        author: 'Douglas Crockford',
        genre: 'Web Development',
        isbn: '978-0596517748',
        description: 'Unearths the elegant subset of JavaScript, focusing on functions, closures, objects, and prototypal inheritance.',
        cover_image_url: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=500',
        total_copies: 5,
        available_copies: 4,
        added_date: '2024-03-15'
      },
      {
        title: 'Python Crash Course',
        author: 'Eric Matthes',
        genre: 'Programming',
        isbn: '978-1593279288',
        description: 'Hands-on project-based introduction to programming in Python 3.',
        cover_image_url: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=500',
        total_copies: 6,
        available_copies: 4,
        added_date: '2024-03-20'
      },
      {
        title: 'You Don\'t Know JS Yet: Get Started',
        author: 'Kyle Simpson',
        genre: 'Web Development',
        isbn: '978-1838833961',
        description: 'Deep dive into JavaScript core mechanics, scope, closures, and object prototypes.',
        cover_image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500',
        total_copies: 2,
        available_copies: 0,
        added_date: '2024-04-01'
      },
      {
        title: 'Designing Data-Intensive Applications',
        author: 'Martin Kleppmann',
        genre: 'Database Systems',
        isbn: '978-1449373320',
        description: 'Key principles for reliable, scalable, and maintainable distributed data architectures.',
        cover_image_url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=500',
        total_copies: 5,
        available_copies: 3,
        added_date: '2024-04-10'
      },
      {
        title: 'The Pragmatic Programmer',
        author: 'Andrew Hunt, David Thomas',
        genre: 'Software Engineering',
        isbn: '978-0135957059',
        description: 'Practical career and software engineering guidance for modern coders.',
        cover_image_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500',
        total_copies: 4,
        available_copies: 2,
        added_date: '2024-04-15'
      },
      {
        title: 'Head First Design Patterns',
        author: 'Eric Freeman, Elisabeth Robson',
        genre: 'Software Engineering',
        isbn: '978-0596007126',
        description: 'Visually rich guide to object-oriented software architecture and pattern implementations.',
        cover_image_url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=500',
        total_copies: 3,
        available_copies: 1,
        added_date: '2024-05-01'
      },
      {
        title: 'Modern Operating Systems',
        author: 'Andrew S. Tanenbaum',
        genre: 'Computer Science',
        isbn: '978-0133591620',
        description: 'Classic textbook explaining hardware-software interface, virtualization, security, and OS design.',
        cover_image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500',
        total_copies: 3,
        available_copies: 2,
        added_date: '2024-05-10'
      },
      {
        title: 'Structure and Interpretation of Computer Programs (SICP)',
        author: 'Harold Abelson, Gerald Jay Sussman',
        genre: 'Computer Science',
        isbn: '978-0262510875',
        description: 'The famous MIT textbook explaining programming paradigms, interpreters, and abstraction techniques.',
        cover_image_url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500',
        total_copies: 2,
        available_copies: 1,
        added_date: '2024-05-15'
      }
    ]);

    // 4. Create 5 Linked Ebooks
    console.log('Seeding Ebooks...');
    await Ebook.bulkCreate([
      {
        book_id: books[0].id, // Database System Concepts
        file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        file_type: 'pdf'
      },
      {
        book_id: books[1].id, // Clean Code
        file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        file_type: 'pdf'
      },
      {
        book_id: books[3].id, // Artificial Intelligence
        file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        file_type: 'epub'
      },
      {
        book_id: books[7].id, // JS The Good Parts
        file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        file_type: 'pdf'
      },
      {
        book_id: books[10].id, // Designing Data-Intensive Applications
        file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        file_type: 'pdf'
      }
    ]);

    // 5. Create 9 Transactions (including 3 overdue transactions)
    console.log('Seeding Transactions...');
    const today = new Date();
    
    // Dates for overdue calculation
    const tenDaysAgo = new Date(today);
    tenDaysAgo.setDate(today.getDate() - 10);

    const fiveDaysAgo = new Date(today);
    fiveDaysAgo.setDate(today.getDate() - 5);

    const twentyDaysAgo = new Date(today);
    twentyDaysAgo.setDate(today.getDate() - 20);

    const thirtyFiveDaysAgo = new Date(today);
    thirtyFiveDaysAgo.setDate(today.getDate() - 35);

    const fifteenDaysAgo = new Date(today);
    fifteenDaysAgo.setDate(today.getDate() - 15);

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const twoWeeks = new Date(today);
    twoWeeks.setDate(today.getDate() + 14);

    await Transaction.bulkCreate([
      // Overdue 1: Alice Johnson - Database System Concepts (due 10 days ago -> 10 * 5 = ₹50 fine preview)
      {
        user_id: members[0].id,
        book_id: books[0].id,
        issue_date: thirtyFiveDaysAgo,
        due_date: tenDaysAgo,
        return_date: null,
        status: 'issued', // will calculate fine on-the-fly
        fine_amount: 0.00,
        fine_paid: false,
        issued_by: admin.id
      },
      // Overdue 2: Bob Smith - CLRS Algorithms (due 15 days ago -> 15 * 5 = ₹75 fine preview)
      {
        user_id: members[1].id,
        book_id: books[2].id,
        issue_date: thirtyFiveDaysAgo,
        due_date: fifteenDaysAgo,
        return_date: null,
        status: 'issued',
        fine_amount: 0.00,
        fine_paid: false,
        issued_by: admin.id
      },
      // Overdue 3: Charlie Davis - Operating System Concepts (due 45 days ago -> capped at ₹200)
      {
        user_id: members[2].id,
        book_id: books[4].id,
        issue_date: '2024-05-01',
        due_date: '2024-05-15',
        return_date: null,
        status: 'issued',
        fine_amount: 0.00,
        fine_paid: false,
        issued_by: admin.id
      },
      // Active Normal 1: Diana Prince - Clean Code (due in 7 days)
      {
        user_id: members[3].id,
        book_id: books[1].id,
        issue_date: tenDaysAgo,
        due_date: nextWeek,
        return_date: null,
        status: 'issued',
        fine_amount: 0.00,
        fine_paid: false,
        issued_by: admin.id
      },
      // Active Normal 2: Ethan Hunt - AI Modern Approach (due in 14 days)
      {
        user_id: members[4].id,
        book_id: books[3].id,
        issue_date: today,
        due_date: twoWeeks,
        return_date: null,
        status: 'issued',
        fine_amount: 0.00,
        fine_paid: false,
        issued_by: admin.id
      },
      // Returned Past 1 (No Fine): Fiona Gallagher - Computer Networking (0 days late -> ₹0 fine)
      {
        user_id: members[5].id,
        book_id: books[6].id,
        issue_date: thirtyFiveDaysAgo,
        due_date: twentyDaysAgo,
        return_date: twentyDaysAgo,
        status: 'returned',
        fine_amount: calculateFine(twentyDaysAgo, twentyDaysAgo),
        fine_paid: true,
        issued_by: admin.id
      },
      // Returned Past 2 (With Fine Paid): Alice Johnson - JS The Good Parts (Returned 10 days late -> ₹50 fine paid)
      {
        user_id: members[0].id,
        book_id: books[7].id,
        issue_date: thirtyFiveDaysAgo,
        due_date: twentyDaysAgo,
        return_date: tenDaysAgo,
        status: 'returned',
        fine_amount: calculateFine(twentyDaysAgo, tenDaysAgo), // 10 days late * ₹5 = ₹50.00
        fine_paid: true,
        issued_by: admin.id
      },
      // Returned Past 3 (With Unpaid Fine): Bob Smith - Designing Data Intensive Apps (Returned 10 days late -> ₹50 fine UNPAID)
      {
        user_id: members[1].id,
        book_id: books[10].id,
        issue_date: thirtyFiveDaysAgo,
        due_date: twentyDaysAgo,
        return_date: tenDaysAgo,
        status: 'returned',
        fine_amount: calculateFine(twentyDaysAgo, tenDaysAgo), // 10 days late * ₹5 = ₹50.00
        fine_paid: false,
        issued_by: admin.id
      },
      // Active Normal 3: Fiona Gallagher - Python Crash Course
      {
        user_id: members[5].id,
        book_id: books[8].id,
        issue_date: fiveDaysAgo,
        due_date: nextWeek,
        return_date: null,
        status: 'issued',
        fine_amount: 0.00,
        fine_paid: false,
        issued_by: admin.id
      }
    ]);

    // 6. Create 3 Sample Reservations in different states
    console.log('Seeding Reservations...');
    
    // Ready reservation expiry: in 2 days
    const inTwoDays = new Date(today);
    inTwoDays.setDate(today.getDate() + 2);

    // Expired reservation expiry: 2 days ago
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(today.getDate() - 2);

    await Reservation.bulkCreate([
      // State 1: 'waiting' - Alice waiting on CLRS Algorithms (Book #3, 0 available copies)
      {
        user_id: members[0].id,
        book_id: books[2].id,
        reservation_date: fiveDaysAgo,
        ready_date: null,
        expiry_date: null,
        status: 'waiting',
        queue_position: 1
      },
      // State 2: 'waiting' position 2 - Charlie waiting on CLRS Algorithms (Book #3)
      {
        user_id: members[2].id,
        book_id: books[2].id,
        reservation_date: tenDaysAgo,
        ready_date: null,
        expiry_date: null,
        status: 'waiting',
        queue_position: 2
      },
      // State 3: 'ready' - Diana Prince reservation for You Don't Know JS (Book #10) holds a ready copy
      {
        user_id: members[3].id,
        book_id: books[9].id,
        reservation_date: tenDaysAgo,
        ready_date: today,
        expiry_date: inTwoDays, // Ready with active expiry countdown!
        status: 'ready',
        queue_position: 1
      },
      // State 4: 'expired' - Ethan Hunt had a ready reservation on Database System Concepts that expired
      {
        user_id: members[4].id,
        book_id: books[0].id,
        reservation_date: thirtyFiveDaysAgo,
        ready_date: tenDaysAgo,
        expiry_date: twoDaysAgo, // Expired state for lifecycle demonstration
        status: 'expired',
        queue_position: 1
      }
    ]);

    // 7. Create Sample Reviews
    console.log('Seeding Reviews...');
    await Review.bulkCreate([
      {
        user_id: members[0].id,
        book_id: books[0].id,
        rating: 5,
        comment: 'Essential database book for any CS student! Clear diagrams on B-Trees and transactions.',
        date: '2024-03-01'
      },
      {
        user_id: members[1].id,
        book_id: books[1].id,
        rating: 5,
        comment: 'Transformed the way I write clean functions and structure code bases.',
        date: '2024-03-10'
      },
      {
        user_id: members[3].id,
        book_id: books[2].id,
        rating: 4,
        comment: 'Very detailed and mathematical. Great reference manual for algorithms.',
        date: '2024-04-05'
      }
    ]);

    console.log('✅ Database Seeding Completed Successfully!');
    console.log('Admin Account: email: admin@library.com | password: admin123');
    console.log('Sample Member: email: alice@student.edu | password: member123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database Seeding Failed:', error);
    process.exit(1);
  }
}

seedDatabase();
