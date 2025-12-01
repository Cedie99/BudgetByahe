<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CmsSetting;

class CmsSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $settings = [
            // Navbar Settings
            [
                'key' => 'navbar_brand',
                'value' => 'Budget Biyahe',
                'type' => 'text',
                'group' => 'navbar',
                'description' => 'Brand name displayed in navigation bar'
            ],
            [
                'key' => 'navbar_logo',
                'value' => '',
                'type' => 'image',
                'group' => 'navbar',
                'description' => 'Logo image displayed in navigation bar'
            ],

            // Hero Section
            [
                'key' => 'hero_title',
                'value' => 'Smart Fare Calculation for Tricycles & Jeepneys',
                'type' => 'text',
                'group' => 'hero',
                'description' => 'Main title displayed in hero section'
            ],
            [
                'key' => 'hero_subtitle',
                'value' => 'Empowering commuters with accurate, fair, and easy-to-understand fare calculations for every ride.',
                'type' => 'textarea',
                'group' => 'hero',
                'description' => 'Subtitle text displayed in hero section'
            ],
            [
                'key' => 'hero_button_text',
                'value' => 'Find My Route',
                'type' => 'text',
                'group' => 'hero',
                'description' => 'Text for main call-to-action button'
            ],

            // Features Section
            [
                'key' => 'feature1_title',
                'value' => 'Seamless Fare Updates',
                'type' => 'text',
                'group' => 'features',
                'description' => 'Title for first feature'
            ],
            [
                'key' => 'feature1_description',
                'value' => 'Stay informed with automatically updated fare rates for your routes and destinations.',
                'type' => 'textarea',
                'group' => 'features',
                'description' => 'Description for first feature'
            ],
            [
                'key' => 'feature2_title',
                'value' => 'Smart Route Assistance',
                'type' => 'text',
                'group' => 'features',
                'description' => 'Title for second feature'
            ],
            [
                'key' => 'feature2_description',
                'value' => 'Discover the best and most affordable route combinations with real-time mapping.',
                'type' => 'textarea',
                'group' => 'features',
                'description' => 'Description for second feature'
            ],
            [
                'key' => 'feature3_title',
                'value' => '24/7 Fare Access',
                'type' => 'text',
                'group' => 'features',
                'description' => 'Title for third feature'
            ],
            [
                'key' => 'feature3_description',
                'value' => 'Access fare information anytime, anywhere — whether online or on-the-go.',
                'type' => 'textarea',
                'group' => 'features',
                'description' => 'Description for third feature'
            ],

            // About Section
            [
                'key' => 'about_title',
                'value' => 'About Budget Biyahe',
                'type' => 'text',
                'group' => 'about',
                'description' => 'Title for about section'
            ],
            [
                'key' => 'about_description',
                'value' => 'Budget Biyahe is a Transparent Fare Calculation System for Tricycle and Jeepney Services, aims to revolutionize local public transportation by providing commuters and drivers with a fair, accurate, and easy-to-use fare calculation platform. By leveraging modern web technologies and real-time data, our system ensures transparency in fare computation, reduces disputes, and promotes trust between passengers and drivers.',
                'type' => 'textarea',
                'group' => 'about',
                'description' => 'Description for about section'
            ],

            // Footer Settings
            [
                'key' => 'footer_text',
                'value' => 'Your smart travel companion for everyday commuting.',
                'type' => 'text',
                'group' => 'footer',
                'description' => 'Main footer text/tagline'
            ],
            [
                'key' => 'contact_email',
                'value' => 'support@budgetbyahe.com',
                'type' => 'email',
                'group' => 'footer',
                'description' => 'Contact email address'
            ],
            [
                'key' => 'contact_phone',
                'value' => '+63 900 123 4567',
                'type' => 'phone',
                'group' => 'footer',
                'description' => 'Contact phone number'
            ],

            // Social Media Links
            [
                'key' => 'facebook_url',
                'value' => '',
                'type' => 'url',
                'group' => 'social',
                'description' => 'Facebook page URL'
            ],
            [
                'key' => 'twitter_url',
                'value' => '',
                'type' => 'url',
                'group' => 'social',
                'description' => 'Twitter/X profile URL'
            ],
            [
                'key' => 'instagram_url',
                'value' => '',
                'type' => 'url',
                'group' => 'social',
                'description' => 'Instagram profile URL'
            ],

            // Theme Colors
            [
                'key' => 'primary_color',
                'value' => '#0a5c36',
                'type' => 'color',
                'group' => 'colors',
                'description' => 'Primary brand color'
            ],
            [
                'key' => 'secondary_color',
                'value' => '#0d7a49',
                'type' => 'color',
                'group' => 'colors',
                'description' => 'Secondary brand color'
            ],
            [
                'key' => 'accent_color',
                'value' => '#fbbf24',
                'type' => 'color',
                'group' => 'colors',
                'description' => 'Accent color for highlights'
            ]
        ];

        foreach ($settings as $setting) {
            CmsSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}