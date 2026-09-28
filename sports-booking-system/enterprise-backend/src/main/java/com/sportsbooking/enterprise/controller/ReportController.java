package com.sportsbooking.enterprise.controller;

import com.sportsbooking.enterprise.dto.ApiResponse;
import com.sportsbooking.enterprise.model.Category;
import com.sportsbooking.enterprise.service.ExcelDataImportService;
import com.sportsbooking.enterprise.service.JasperReportService;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReportController {

    private final JasperReportService jasperReportService;
    private final ExcelDataImportService excelDataImportService;

    @Data
    @Builder
    @AllArgsConstructor
    public static class InvoiceItem {
        private String itemName;
        private Integer quantity;
        private Double unitPrice;
        private Double totalPrice;
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class InventoryProduct {
        private String sku;
        private String productName;
        private String category;
        private Integer stockQuantity;
        private Double costPrice;
        private Double sellingPrice;
    }

    /**
     * Export Booking Invoice as PDF using JasperReports
     */
    @GetMapping("/booking-invoice/{id}/pdf")
    public ResponseEntity<byte[]> exportBookingInvoicePdf(@PathVariable String id) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("INVOICE_NUMBER", "INV-" + id);
        params.put("CUSTOMER_NAME", "Nguyen Van An");
        params.put("CUSTOMER_PHONE", "0901234567");
        params.put("COURT_NAME", "San Bong Da Mini Chuyen Nghiep #1");
        params.put("CATEGORY_NAME", "Bong Da 7 Nguoi");
        params.put("BOOKING_DATE", "2026-09-29");
        params.put("TIME_SLOT", "18:00 - 20:00");
        params.put("TOTAL_AMOUNT", 750000.0);
        params.put("DISCOUNT_AMOUNT", 50000.0);
        params.put("FINAL_AMOUNT", 700000.0);
        params.put("PAYMENT_METHOD", "Cashier POS / Banking");

        List<InvoiceItem> items = Arrays.asList(
                new InvoiceItem("Tien thue san (2h)", 1, 600000.0, 600000.0),
                new InvoiceItem("Thue 2 bo ao bib tap luyen", 2, 25000.0, 50000.0),
                new InvoiceItem("Nuoc khoang Pocari Sweat", 5, 20000.0, 100000.0)
        );

        byte[] pdfBytes = jasperReportService.exportReportToPdf("reports/booking_invoice.jrxml", params, items);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "Booking_Invoice_" + id + ".pdf");
        return ResponseEntity.ok().headers(headers).body(pdfBytes);
    }

    /**
     * Export Inventory & Purchasing report as Excel (XLSX)
     */
    @GetMapping("/inventory/excel")
    public ResponseEntity<byte[]> exportInventoryExcel() throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("REPORT_TITLE", "Bao Cao Nhap Hang & Ton Kho Thiet Bi The Thao");
        params.put("GENERATED_BY", "Admin Portal Manager");
        params.put("REPORT_DATE", "2026-09-28");
        params.put("TOTAL_ITEMS", 4);
        params.put("TOTAL_VALUE", 12500000.0);

        List<InventoryProduct> products = Arrays.asList(
                new InventoryProduct("SKU-BB01", "Bong Da FIFA Pro Star", "Bong Da", 20, 300000.0, 450000.0),
                new InventoryProduct("SKU-VR02", "Vot Cau Long Yonex Nanoflare", "Cau Long", 15, 600000.0, 850000.0),
                new InventoryProduct("SKU-PB03", "Bong Pickleball Dura Fast 40", "Pickleball", 100, 40000.0, 65000.0),
                new InventoryProduct("SKU-NK04", "Nuoc dien giai Pocari Sweat", "Giai Khat", 200, 12000.0, 20000.0)
        );

        byte[] excelBytes = jasperReportService.exportReportToExcel("reports/purchasing_inventory_report.jrxml", params, products);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", "Inventory_Purchasing_Report.xlsx");
        return ResponseEntity.ok().headers(headers).body(excelBytes);
    }

    /**
     * Import Categories or Products from Excel (.xlsx) using Apache POI
     */
    @PostMapping(value = "/import/excel", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<List<Category>>> importExcel(@RequestParam("file") MultipartFile file) throws Exception {
        List<Category> imported = excelDataImportService.importCategoriesFromExcel(file);
        return ResponseEntity.ok(ApiResponse.ok(imported, "Imported " + imported.size() + " items from Excel successfully"));
    }
}
