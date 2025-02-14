export const getShareEmailTemplate = (documentTitle, senderName, accessLevel, loginLink) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    .container {
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #0284c7;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      padding: 20px;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      color: #ffffff;
      background-color: #0284c7;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      color: #64748b;
      padding: 20px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Document Shared with You</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p><strong>${senderName}</strong> has shared a document with you: <strong>${documentTitle}</strong></p>
      <p>You have been granted <strong>${accessLevel}</strong> access to this document.</p>
      <p>Access level permissions:</p>
      <ul>
        ${accessLevel === 'editor' ? `
          <li>View the document</li>
          <li>Edit the document content</li>
          <li>Edit the document title</li>
        ` : accessLevel === 'reviewer' ? `
          <li>View the document</li>
          <li>Read-only access</li>
          <li>Cannot make changes</li>
        ` : `
          <li>View the document</li>
          <li>Read-only access</li>
        `}
      </ul>
      <center>
        <a href="${loginLink}" class="button">View Document</a>
      </center>
      <p>If you don't have an account yet, you'll be able to create one when you click the link.</p>
    </div>
    <div class="footer">
      <p>This is an automated message, please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
`; 