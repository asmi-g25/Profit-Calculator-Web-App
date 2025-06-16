import { Button } from "@/components/ui/button";
import { FileDown, Printer, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CalculationResults } from "@shared/schema";

interface ExportFunctionalityProps {
  results: CalculationResults;
  containerId: string;
  destination: string;
}

export default function ExportFunctionality({ results, containerId, destination }: ExportFunctionalityProps) {
  const { toast } = useToast();

  const exportToPDF = () => {
    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Export Estimate - ${containerId}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 20px; }
          .cost-breakdown { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .total { font-weight: bold; border-top: 1px solid #ccc; padding-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Grain Export Cost Estimate</h1>
          <p>Container: ${containerId} | Destination: ${destination}</p>
          <p>Generated: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="section">
          <h2>Cost Breakdown</h2>
          <div class="cost-breakdown">
            <span>Raw Materials Cost:</span>
            <span>$${results.rawMaterialsCost.toFixed(2)}</span>
          </div>
          <div class="cost-breakdown">
            <span>Transport Cost:</span>
            <span>$${results.transportCost.toFixed(2)}</span>
          </div>
          <div class="cost-breakdown">
            <span>Total Procurement Cost:</span>
            <span>$${results.totalProcurementCost.toFixed(2)}</span>
          </div>
          <div class="cost-breakdown total">
            <span>Invoice Value:</span>
            <span>$${results.invoiceValue.toFixed(2)}</span>
          </div>
        </div>

        <div class="section">
          <h2>Product Breakdown</h2>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Cost</th>
                <th>Invoice Price</th>
                <th>Distributor Price</th>
                <th>Retailer Price</th>
              </tr>
            </thead>
            <tbody>
              ${results.productBreakdown.map(product => `
                <tr>
                  <td>${product.name}</td>
                  <td>${product.quantity} MT</td>
                  <td>$${product.unitCost.toFixed(2)}</td>
                  <td>$${product.invoicePrice.toFixed(2)}</td>
                  <td>$${product.distributorPrice.toFixed(2)}</td>
                  <td>$${product.retailerPrice.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;

    // Create and download PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    }

    toast({
      title: "PDF Generated",
      description: "Print dialog opened for PDF export",
    });
  };

  const exportToExcel = () => {
    // Create CSV content
    const csvContent = [
      ['Grain Export Cost Estimate'],
      [`Container: ${containerId}`],
      [`Destination: ${destination}`],
      [`Generated: ${new Date().toLocaleDateString()}`],
      [''],
      ['Cost Breakdown'],
      ['Item', 'Amount'],
      ['Raw Materials Cost', `$${results.rawMaterialsCost.toFixed(2)}`],
      ['Transport Cost', `$${results.transportCost.toFixed(2)}`],
      ['Packing Cost', `$${results.packingCost.toFixed(2)}`],
      ['Total Procurement Cost', `$${results.totalProcurementCost.toFixed(2)}`],
      ['Invoice Value', `$${results.invoiceValue.toFixed(2)}`],
      ['Importer Total Cost', `$${results.importerTotalCost.toFixed(2)}`],
      ['Distributor Price', `$${results.distributorPrice.toFixed(2)}`],
      ['Retailer Price', `$${results.retailerPrice.toFixed(2)}`],
      [''],
      ['Product Breakdown'],
      ['Product', 'Quantity', 'Unit Cost', 'Invoice Price', 'Distributor Price', 'Retailer Price'],
      ...results.productBreakdown.map(product => [
        product.name,
        `${product.quantity} MT`,
        `$${product.unitCost.toFixed(2)}`,
        `$${product.invoicePrice.toFixed(2)}`,
        `$${product.distributorPrice.toFixed(2)}`,
        `$${product.retailerPrice.toFixed(2)}`
      ])
    ];

    const csvString = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grain-export-estimate-${containerId}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Excel Export Complete",
      description: "CSV file downloaded successfully",
    });
  };

  const emailReport = () => {
    const subject = `Grain Export Estimate - ${containerId}`;
    const body = `
Dear Team,

Please find the grain export estimate details for container ${containerId} to ${destination}:

Summary:
- Total Procurement Cost: $${results.totalProcurementCost.toFixed(2)}
- Invoice Value: $${results.invoiceValue.toFixed(2)}
- Importer Total Cost: $${results.importerTotalCost.toFixed(2)}
- Final Retailer Price: $${results.retailerPrice.toFixed(2)}

Generated on: ${new Date().toLocaleDateString()}

Best regards,
Export Team
    `;

    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);

    toast({
      title: "Email Client Opened",
      description: "Email draft created with estimate details",
    });
  };

  return (
    <div className="flex space-x-3">
      <Button variant="outline" onClick={exportToPDF}>
        <FileDown className="mr-2" size={16} />
        Export PDF
      </Button>
      <Button variant="outline" onClick={exportToExcel}>
        <FileDown className="mr-2" size={16} />
        Export Excel
      </Button>
      <Button variant="outline" onClick={emailReport}>
        <Mail className="mr-2" size={16} />
        Email Report
      </Button>
    </div>
  );
}