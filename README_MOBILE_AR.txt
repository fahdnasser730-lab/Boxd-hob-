ربط Itz_fahd_YT Hub بـ Firebase (من الموبايل)

محتويات الملف:
- index.html و script.js و style.css و firebase-bridge.js
- الصور الأصلية
- FIRESTORE_RULES.txt (قواعد قاعدة البيانات)

قبل الرفع:
1) في Firebase Console > Authentication > Sign-in method تأكد أن Email/Password = Enabled.
2) في Firestore Database > Rules انسخ محتوى FIRESTORE_RULES.txt بالكامل واضغط Publish.
3) على GitHub افتح مستودع الموقع. افتح كل ملف من الملفات القديمة ثم Delete file، أو استخدم Add file > Upload files لاستبدالها بالملفات الجديدة. ارفع الملفات الموجودة في جذر هذا الأرشيف، وليس ملف ZIP نفسه.
4) ارفع على الأقل index.html وscript.js وstyle.css وfirebase-bridge.js وchannel-avatar.png وsite-background.png إلى جذر المستودع. احتفظ ببقية الملفات إن كانت موجودة.
5) انتظر تحديث GitHub Pages ثم افتح الموقع في نافذة خاصة.
6) أنشئ حسابًا/سجّل الدخول باستخدام اسم المستخدم والإيميل وكلمة مرور. الإيميل مطلوب الآن لأن Firebase Authentication يحتاجه.
7) افتح Community posts واكتب منشورًا نصيًا أو رابطًا. المرفقات المصورة والفيديو غير مفعّلة في هذه النسخة حتى نضبط Firebase Storage.
8) افتح الموقع في متصفح آخر؛ يجب أن يظهر المنشور من Firestore.

تنبيه:
- الحسابات والمنشورات المحلية القديمة لا تنتقل تلقائيًا إلى Firebase؛ أعد نشر المنشورات التي تريد مشاركتها.
- هذه النسخة تربط الحسابات والمنشورات النصية/الروابط فقط. الأكواد والمخططات والدردشة والإعجابات والتعليقات ما زالت تحتاج ربطًا منفصلًا.
- لا ترسل كلمة المرور لأي شخص. إعدادات Firebase Web داخل الصفحة عامة بطبيعتها؛ الأمان يأتي من قواعد Firestore.
