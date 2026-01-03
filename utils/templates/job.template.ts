export const jobListTemplate = ({
  name,
  jobs
}: {
  name: string;
  jobs: Array<{
    title: string;
    company?: string;
    logo?: string;
    location: string;
    salary?: string;
    url: string;
    score: number;
  }>;
}) => {

  const companyLogo = "https://zobly.in/logo.png"
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f2f5;">
  
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; overflow: hidden;">
    
    <!-- HEADER SECTION -->
    <div style="background-color: #1e293b; padding: 40px 20px; text-align: center;">
      
      <!-- YOUR CUSTOM LOGO HERE -->
      <img 
        src="${companyLogo}" 
        alt="Company Logo" 
        width="48" 
        height="48"
        style="margin: 0 auto 20px auto; display: block; width: 48px; height: 48px; border-radius: 12px; object-fit: contain; background-color: #ffffff; padding: 4px;" 
      />

      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Daily Job Matches</h1>
      <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 16px;">
        Hi ${name}, we found <strong>${jobs.length} roles</strong> for you.
      </p>
    </div>

    <div style="padding: 20px;">
      
      ${jobs
      .map((job) => {
        const matchColor = "#16a34a";
        const matchBg = "#dcfce7";
        const companyName = job.company || "Job Opportunity";
        const fallbackLetters = companyName.substring(0, 2).toUpperCase();

        const logoHtml = job.logo
          ? `<img src="${job.logo}" alt="${companyName}" style="width: 48px; height: 48px; border-radius: 8px; object-fit: cover; border: 1px solid #e2e8f0;">`
          : `<div style="width: 48px; height: 48px; background-color: #f1f5f9; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #64748b; font-weight: bold; font-size: 18px; border: 1px solid #e2e8f0;">${fallbackLetters}</div>`;

        return `
          <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); overflow: hidden;">
            
            <div style="background-color: ${matchBg}; padding: 8px 20px; border-bottom: 1px solid #bbf7d0;">
              <span style="color: ${matchColor}; font-weight: 800; font-size: 14px; letter-spacing: 0.5px;">
                ⚡ ${job.score}% MATCH
              </span>
            </div>

            <div style="padding: 20px;">
              <div style="display: flex; gap: 15px; align-items: flex-start;">
                <div style="flex-shrink: 0;">
                  ${logoHtml}
                </div>
                <div style="flex-grow: 1;">
                  <h3 style="margin: 0 0 4px 0; color: #1e293b; font-size: 18px; line-height: 1.3;">
                    ${job.title}
                  </h3>
                  <p style="margin: 0 0 8px 0; color: #475569; font-weight: 600; font-size: 14px;">
                    ${companyName}
                  </p>
                  <p style="margin: 0; color: #64748b; font-size: 14px;">
                    📍 ${job.location}
                  </p>
                </div>
              </div>

              <div style="margin-top: 15px;">
                <a href="${job.url}" target="_blank" style="display: block; width: 100%; text-align: center; background-color: #2563eb; color: #ffffff; padding: 12px 0; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                  View & Apply &rarr;
                </a>
              </div>
            </div>
          </div>
          `;
      })
      .join("")}

      <!-- FOOTER LOGO -->
      <div style="text-align: center; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
        
        <!-- Small Footer Logo (Grayscale/Faded) -->
        <img 
          src="${companyLogo}" 
          alt="zobly" 
          width="32" 
          height="32"
          style="margin: 0 auto 10px auto; display: block; width: 32px; height: 32px; filter: grayscale(100%); opacity: 0.6;" 
        />

        <p style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
          You received this match alert based on your preferences.<br>
          <a href="#" style="color: #64748b; text-decoration: underline;">Unsubscribe</a>
        </p>
      </div>

    </div>
  </div>
</body>
</html>
`;
};