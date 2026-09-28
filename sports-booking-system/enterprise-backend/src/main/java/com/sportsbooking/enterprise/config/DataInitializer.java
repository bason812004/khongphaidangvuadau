package com.sportsbooking.enterprise.config;

import com.sportsbooking.enterprise.entity.Role;
import com.sportsbooking.enterprise.entity.User;
import com.sportsbooking.enterprise.mapper.CategoryMapper;
import com.sportsbooking.enterprise.model.Category;
import com.sportsbooking.enterprise.repository.RoleRepository;
import com.sportsbooking.enterprise.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CategoryMapper categoryMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        log.info("Initializing Enterprise Default Seed Data for User Management & Categories...");

        // 1. Seed Roles
        Role adminRole = getOrCreateRole("ROLE_ADMIN", "Administrator with full system access");
        Role checkerRole = getOrCreateRole("ROLE_CHECKER", "Checker authorized to approve/reject tickets");
        Role partnerRole = getOrCreateRole("ROLE_PARTNER", "Court Partner Manager");
        Role cashierRole = getOrCreateRole("ROLE_CASHIER", "Kiosk POS Cashier Staff");
        Role customerRole = getOrCreateRole("ROLE_CUSTOMER", "End customer player");

        // 2. Seed Default Users with hashed passwords
        createDefaultUser(
                "admin@sportsbooking.com",
                "admin123",
                "System Administrator",
                "0901234567",
                new HashSet<>(Arrays.asList(adminRole, checkerRole))
        );

        createDefaultUser(
                "partner@sportsbooking.com",
                "partner123",
                "San The Thao Da Nang",
                "0912345678",
                new HashSet<>(Arrays.asList(partnerRole))
        );

        createDefaultUser(
                "cashier@sportsbooking.com",
                "cashier123",
                "Thu Ngan Quay Kiosk",
                "0923456789",
                new HashSet<>(Arrays.asList(cashierRole))
        );

        createDefaultUser(
                "customer@sportsbooking.com",
                "customer123",
                "Tran Hoang Long",
                "0934567890",
                new HashSet<>(Arrays.asList(customerRole))
        );

        // 3. Seed Default Categories for MyBatis
        try {
            if (categoryMapper.countByCriteria(null) == 0) {
                categoryMapper.insert(Category.builder()
                        .name("Bóng Đá Sân 7")
                        .slug("bong-da-san-7")
                        .icon("sports_soccer")
                        .description("Sân cỏ nhân tạo chất lượng FIFA")
                        .isActive(true)
                        .displayOrder(1)
                        .build());

                categoryMapper.insert(Category.builder()
                        .name("Cầu Lông Thảm Đấu")
                        .slug("cau-long-tham-dau")
                        .icon("sports_tennis")
                        .description("Thảm cầu lông Yonex giảm chấn")
                        .isActive(true)
                        .displayOrder(2)
                        .build());

                categoryMapper.insert(Category.builder()
                        .name("Pickleball Ngoài Trời")
                        .slug("pickleball-ngoai-troi")
                        .icon("sports_cricket")
                        .description("Sân đệm cao su tiêu chuẩn quốc tế")
                        .isActive(true)
                        .displayOrder(3)
                        .build());

                categoryMapper.insert(Category.builder()
                        .name("Tennis Tiêu Chuẩn")
                        .slug("tennis-tieu-chuan")
                        .icon("sports_baseball")
                        .description("Sân cứng đạt chuẩn thi đấu")
                        .isActive(true)
                        .displayOrder(4)
                        .build());

                log.info("Default categories seeded successfully via MyBatis!");
            }
        } catch (Exception e) {
            log.warn("Category initial seed check: {}", e.getMessage());
        }

        log.info("Data initialization complete! Default accounts ready: admin@sportsbooking.com / admin123");
    }

    private Role getOrCreateRole(String name, String description) {
        return roleRepository.findByName(name)
                .orElseGet(() -> roleRepository.save(Role.builder().name(name).description(description).build()));
    }

    private void createDefaultUser(String email, String rawPassword, String fullName, String phone, Set<Role> roles) {
        if (!userRepository.existsByEmail(email)) {
            User user = User.builder()
                    .email(email)
                    .password(passwordEncoder.encode(rawPassword))
                    .fullName(fullName)
                    .phone(phone)
                    .isActive(true)
                    .roles(roles)
                    .build();
            userRepository.save(user);
            log.info("Created user: {} (Password: {})", email, rawPassword);
        }
    }
}
