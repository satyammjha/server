export const jobListTemplate = ({
  name,
  jobs,
}: {
  name: string;
  jobs: Array<{
    title: string;
    location: string;
    salary?: string;
    url: string;
    score: number;
  }>;
}) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f2f5;">
  
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; overflow: hidden;">
    
    <!-- HEADER -->
    <div style="background-color: #1e293b; padding: 30px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🎯 Daily Job Matches</h1>
      <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 16px;">
        Hi ${name}, we found <strong>${jobs.length} roles</strong> that fit your profile perfectly.
      </p>
    </div>

    <div style="padding: 20px;">
      
      <!-- JOB CARDS LOOP -->
      ${jobs
      .map((job) => {
        const hasSalary = job.salary && job.salary.toString().trim() !== "0";

        const matchColor = "#16a34a";
        const matchBg = "#dcfce7";

        return `
          <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); overflow: hidden;">
            
            <!-- MATCH SCORE HEADER -->
            <div style="background-color: ${matchBg}; padding: 8px 20px; border-bottom: 1px solid #bbf7d0; display: flex; align-items: center;">
              <span style="color: ${matchColor}; font-weight: 800; font-size: 14px; letter-spacing: 0.5px;">
                ⚡ ${job.score}% MATCH
              </span>
            </div>

            <div style="padding: 20px;">
              <!-- JOB TITLE -->
              <h3 style="margin: 0 0 5px 0; color: #1e293b; font-size: 18px; line-height: 1.4;">
                ${job.title}
              </h3>
              
              <!-- LOCATION -->
              <p style="margin: 0 0 15px 0; color: #64748b; font-size: 14px;">
                📍 ${job.location}
              </p>

              <!-- CTA BUTTON -->
              <div style="margin-top: 10px;">
                <a href="${job.url}" target="_blank" style="display: block; width: 100%; text-align: center; background-color: #2563eb; color: #ffffff; padding: 12px 0; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                  View Job & Apply &rarr;
                </a>
              </div>
            </div>
          </div>
          `;
      })
      .join("")}

      <!-- FOOTER -->
      <div style="text-align: center; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
        <p style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
          You received this because your profile matched these roles.<br>
          <a href="#" style="color: #64748b; text-decoration: underline;">Adjust Preferences</a>
        </p>
      </div>

    </div>
  </div>
</body>
</html>
`;
};